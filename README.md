# 🍎 과일 매칭 퍼즐 (Fruit Match)

멀티플레이어 랭킹 시스템이 포함된 과일 매칭 퍼즐 게임입니다.

## 🎮 게임 방법

1. **닉네임 입력** 후 게임 시작
2. **동일한 과일 2개**를 찾아서 클릭
3. 두 과일이 **최대 2번 꺾어서 연결** 가능해야 매칭 성공
4. **제한 시간 내**에 모든 과일을 제거하면 레벨 클리어
5. 레벨이 올라갈수록 과일 수 증가, 시간 감소

## ⭐ 특징

- 🎯 **레벨 시스템**: 레벨이 올라갈수록 난이도 증가
- ⏰ **타임어택**: 시간이 지날수록 보너스 점수 감소
- 🔥 **콤보 시스템**: 연속 매칭 시 추가 점수
- 💡 **힌트 기능**: 매칭 가능한 쌍 표시
- 🔀 **셔플 기능**: 과일 재배치
- 🏆 **전체 랭킹**: 상위 100명 점수 기록

## 🛠 기술 스택

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JS + HTML5 + CSS3
- **Data**: In-memory (서버 재시작 시 초기화)

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 서버 실행

```bash
# 일반 실행
npm start

# 개발 모드 (자동 재시작)
npm run dev
```

### 3. 브라우저에서 접속

```
http://localhost:3000
```

## 📁 프로젝트 구조

```
web1/
├── server/
│   └── index.js          # Express 서버 + API
├── public/
│   ├── index.html        # 메인 페이지
│   ├── css/
│   │   └── style.css     # 스타일
│   └── js/
│       ├── tiles.js      # 과일 타일 정의 및 경로 탐색
│       ├── game.js       # 게임 로직
│       ├── api.js        # API 통신
│       └── app.js        # UI 컨트롤러
├── package.json
└── README.md
```

## 🎯 API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/rankings` | 랭킹 조회 (상위 100명) |
| POST | `/api/score` | 점수 등록 |
| DELETE | `/api/rankings` | 랭킹 초기화 (관리용) |

### 점수 등록 예시

```bash
curl -X POST http://localhost:3000/api/score \
  -H "Content-Type: application/json" \
  -d '{"nickname": "Player1", "score": 5000, "level": 3}'
```

## 🚀 배포

### 환경 변수

```bash
PORT=3000  # 서버 포트 (기본값: 3000)
```

### PM2로 실행 (권장)

```bash
npm install -g pm2
pm2 start server/index.js --name "fruit-match"
```

## 📝 점수 계산

- **기본 점수**: 100점/매칭
- **콤보 보너스**: (콤보 수 - 1) × 20점 (최대 10콤보)
- **레벨 보너스**: 레벨 × 10점
- **시간 보너스**: 남은 시간 × 10점 × 레벨 (레벨 클리어 시)

## 📜 라이선스

MIT License
