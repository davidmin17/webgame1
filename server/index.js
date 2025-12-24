const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Vercel 환경이 아닐 때만 static 파일 서빙
if (process.env.VERCEL !== '1') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// In-memory 데이터 저장소
const gameData = {
  rankings: [],
  maxRankings: 100 // 상위 100명만 저장
};

// API Routes

// 랭킹 조회
app.get('/api/rankings', (req, res) => {
  res.json({
    success: true,
    rankings: gameData.rankings
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
  gameData.rankings.push(entry);

  // 점수 기준 내림차순 정렬
  gameData.rankings.sort((a, b) => b.score - a.score);

  // 상위 N명만 유지
  if (gameData.rankings.length > gameData.maxRankings) {
    gameData.rankings = gameData.rankings.slice(0, gameData.maxRankings);
  }

  // 현재 순위 계산
  const rank = gameData.rankings.findIndex(r => r.id === entry.id) + 1;

  res.json({
    success: true,
    rank: rank > 0 ? rank : null,
    entry
  });
});

// 랭킹 초기화 (관리용)
app.delete('/api/rankings', (req, res) => {
  gameData.rankings = [];
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

