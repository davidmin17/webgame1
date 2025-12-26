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
- 🔥 **콤보 시스템**: 연속 매칭 시 추가 점수 (1.2초 내 연속 매칭)
- 💡 **힌트 기능**: 매칭 가능한 쌍 표시 (레벨 6부터 없음)
- 🔀 **셔플 기능**: 과일 재배치 (레벨 6부터 없음)
- 🏆 **전체 랭킹**: 상위 100명 점수 기록

## 🔥 난이도

| 레벨 | 시간 | 타일 종류 | 힌트 | 셔플 |
|------|------|----------|------|------|
| 1 | 45초 | 10종 | 2개 | 1개 |
| 5 | 65초 | 18종 | 1개 | 1개 |
| 6+ | 70초~ | 20종+ | 0개 | 0개 |
| 10+ | 30초~ | 28종 | 0개 | 0개 |

## 🛠 기술 스택

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JS + HTML5 + CSS3
- **Database**: Upstash Redis (Vercel 배포) / 로컬 파일 (개발)

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
fruit-match/
├── server/
│   └── index.js          # Express 서버 + API + Upstash Redis
├── public/
│   ├── index.html        # 메인 페이지
│   ├── css/
│   │   └── style.css     # 스타일
│   └── js/
│       ├── tiles.js      # 과일 타일 정의 및 경로 탐색
│       ├── game.js       # 게임 로직
│       ├── api.js        # API 통신
│       └── app.js        # UI 컨트롤러
├── data/
│   └── rankings.json     # 로컬 랭킹 데이터 (개발용)
├── vercel.json           # Vercel 배포 설정
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

## 🚀 Vercel 배포

### 1. GitHub에 코드 푸시

```bash
git init
git add .
git commit -m "🍎 과일 매칭 퍼즐 게임"
git remote add origin https://github.com/YOUR_USERNAME/fruit-match.git
git push -u origin main
```

### 2. Upstash Redis 설정

1. [upstash.com](https://upstash.com) 가입
2. Redis 데이터베이스 생성
3. `UPSTASH_REDIS_REST_URL`과 `UPSTASH_REDIS_REST_TOKEN` 복사

### 3. Vercel 배포

1. [vercel.com](https://vercel.com) → GitHub 연동
2. 프로젝트 Import
3. **Environment Variables** 설정:
   - `UPSTASH_REDIS_REST_URL`: Redis URL
   - `UPSTASH_REDIS_REST_TOKEN`: Redis Token
4. Deploy!

## 📝 점수 계산

- **기본 점수**: 100점/매칭
- **콤보 보너스**: (콤보 수 - 1) × 20점 (최대 10콤보)
- **레벨 보너스**: 레벨 × 10점
- **시간 보너스**: 남은 시간 × 10점 × 레벨 (레벨 클리어 시)

## 🔧 환경 변수

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `PORT` | 서버 포트 (기본: 3000) | ❌ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | ✅ (배포시) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token | ✅ (배포시) |

## 📜 라이선스

MIT License
