const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Redis } = require('@upstash/redis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Vercel 환경이 아닐 때만 static 파일 서빙
if (process.env.VERCEL !== '1') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// ============================================
// 데이터 저장소 설정
// ============================================

const MAX_RANKINGS = 100;
const REDIS_KEY = 'fruit-match:rankings';

// Upstash Redis 클라이언트 (환경변수가 있을 때만)
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('🔗 Upstash Redis 연결됨');
} else {
  console.log('📁 로컬 파일 저장 모드 (Upstash 환경변수 없음)');
}

// ============================================
// 파일 기반 저장소 (로컬 폴백용)
// ============================================

const DATA_DIR = path.join(__dirname, '../data');
const RANKINGS_FILE = path.join(DATA_DIR, 'rankings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadRankingsFromFile() {
  try {
    ensureDataDir();
    if (fs.existsSync(RANKINGS_FILE)) {
      const data = fs.readFileSync(RANKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('파일 로드 실패:', error.message);
  }
  return [];
}

function saveRankingsToFile(rankings) {
  try {
    ensureDataDir();
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify(rankings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('파일 저장 실패:', error.message);
    return false;
  }
}

// ============================================
// 통합 데이터 접근 함수
// ============================================

// 랭킹 조회
async function getRankings() {
  // Upstash Redis 사용
  if (redis) {
    try {
      const data = await redis.get(REDIS_KEY);
      return data || [];
    } catch (error) {
      console.error('Redis 조회 실패:', error.message);
      return [];
    }
  }
  // 로컬 파일 사용
  return loadRankingsFromFile();
}

// 랭킹 저장
async function saveRankings(rankings) {
  // Upstash Redis 사용
  if (redis) {
    try {
      await redis.set(REDIS_KEY, rankings);
      return true;
    } catch (error) {
      console.error('Redis 저장 실패:', error.message);
      return false;
    }
  }
  // 로컬 파일 사용
  return saveRankingsToFile(rankings);
}

// ============================================
// API Routes
// ============================================

// 랭킹 조회
app.get('/api/rankings', async (req, res) => {
  try {
    const rankings = await getRankings();
    res.json({
      success: true,
      rankings: rankings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '랭킹 조회 실패'
    });
  }
});

// 점수 등록
app.post('/api/score', async (req, res) => {
  try {
    console.log('[Server] 점수 등록 요청:', req.body);

    const { nickname, score, level, time } = req.body;

    if (!nickname || typeof score !== 'number') {
      console.log('[Server] 유효성 검사 실패:', { nickname, score, scoreType: typeof score });
      return res.status(400).json({
        success: false,
        message: '닉네임과 점수는 필수입니다.'
      });
    }

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      nickname: nickname.substring(0, 20),
      score,
      level: level || 1,
      time: time || 0,
      createdAt: new Date().toISOString()
    };

    console.log('[Server] 새 엔트리 생성:', entry);

    // 현재 랭킹 조회
    let rankings = await getRankings();
    console.log('[Server] 현재 랭킹 수:', rankings.length);

    // 랭킹에 추가
    rankings.push(entry);

    // 점수 기준 내림차순 정렬
    rankings.sort((a, b) => b.score - a.score);

    // 상위 N명만 유지
    if (rankings.length > MAX_RANKINGS) {
      rankings = rankings.slice(0, MAX_RANKINGS);
    }

    // 저장
    const saved = await saveRankings(rankings);
    console.log('[Server] 저장 결과:', saved);

    // 현재 순위 계산
    const rank = rankings.findIndex(r => r.id === entry.id) + 1;

    res.json({
      success: true,
      rank: rank > 0 ? rank : null,
      entry,
      saved
    });
  } catch (error) {
    console.error('[Server] 점수 등록 실패:', error);
    res.status(500).json({
      success: false,
      message: '점수 등록 실패',
      error: error.message
    });
  }
});

// 랭킹 초기화 (관리용)
app.delete('/api/rankings', async (req, res) => {
  try {
    await saveRankings([]);
    res.json({
      success: true,
      message: '랭킹이 초기화되었습니다.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '랭킹 초기화 실패'
    });
  }
});

// 메인 페이지 (로컬 환경용)
if (process.env.VERCEL !== '1') {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// 서버 시작 (로컬 환경용)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, async () => {
    console.log(`🍎 과일 매칭 퍼즐 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`   http://localhost:${PORT}`);

    // 초기 랭킹 로드
    const rankings = await getRankings();
    console.log(`📊 랭킹 데이터: ${rankings.length}개 기록`);
  });
}

// Vercel 서버리스 함수용 export
module.exports = app;
