const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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
// 파일 기반 데이터 저장소
// ============================================

const DATA_DIR = path.join(__dirname, '../data');
const RANKINGS_FILE = path.join(DATA_DIR, 'rankings.json');
const MAX_RANKINGS = 100;

// 데이터 디렉토리 생성
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 랭킹 데이터 로드
function loadRankings() {
  try {
    ensureDataDir();
    if (fs.existsSync(RANKINGS_FILE)) {
      const data = fs.readFileSync(RANKINGS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('랭킹 데이터 로드 실패:', error.message);
  }
  return [];
}

// 랭킹 데이터 저장
function saveRankings(rankings) {
  try {
    ensureDataDir();
    fs.writeFileSync(RANKINGS_FILE, JSON.stringify(rankings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('랭킹 데이터 저장 실패:', error.message);
    return false;
  }
}

// 서버 시작 시 랭킹 데이터 로드
let rankings = loadRankings();
console.log(`📊 랭킹 데이터 로드 완료: ${rankings.length}개 기록`);

// ============================================
// API Routes
// ============================================

// 랭킹 조회
app.get('/api/rankings', (req, res) => {
  res.json({
    success: true,
    rankings: rankings
  });
});

// 점수 등록
app.post('/api/score', (req, res) => {
  const { nickname, score, level, time } = req.body;

  if (!nickname || typeof score !== 'number') {
    return res.status(400).json({
      success: false,
      message: '닉네임과 점수는 필수입니다.'
    });
  }

  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    nickname: nickname.substring(0, 20), // 닉네임 20자 제한
    score,
    level: level || 1,
    time: time || 0,
    createdAt: new Date().toISOString()
  };

  // 랭킹에 추가
  rankings.push(entry);

  // 점수 기준 내림차순 정렬
  rankings.sort((a, b) => b.score - a.score);

  // 상위 N명만 유지
  if (rankings.length > MAX_RANKINGS) {
    rankings = rankings.slice(0, MAX_RANKINGS);
  }

  // 파일에 저장
  const saved = saveRankings(rankings);

  // 현재 순위 계산
  const rank = rankings.findIndex(r => r.id === entry.id) + 1;

  res.json({
    success: true,
    rank: rank > 0 ? rank : null,
    entry,
    saved
  });
});

// 랭킹 초기화 (관리용)
app.delete('/api/rankings', (req, res) => {
  rankings = [];
  saveRankings(rankings);
  res.json({
    success: true,
    message: '랭킹이 초기화되었습니다.'
  });
});

// 메인 페이지 (로컬 환경용)
if (process.env.VERCEL !== '1') {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// 서버 시작 (로컬 환경용)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🍎 과일 매칭 퍼즐 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`   http://localhost:${PORT}`);
  });
}

// Vercel 서버리스 함수용 export
module.exports = app;
