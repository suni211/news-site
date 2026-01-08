# 뉴스 사이트

React + Node.js로 만든 풀스택 뉴스 사이트

## 기능

- 📝 기사 작성/편집 (관리자)
- 💬 댓글 시스템
- 🏷️ 카테고리/태그
- 🔍 검색 기능
- 👤 사용자 인증
- 🎨 관리자 페이지

## 기술 스택

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- SQLite
- JWT 인증
- bcrypt

## 빠른 시작

### 로컬 개발
```bash
# 의존성 설치
npm run install-all

# 개발 모드 실행
npm run dev
```

브라우저에서 http://localhost:5173 접속

### GCP Compute Engine 배포
상세한 배포 가이드는 다음 문서를 참고하세요:
- **빠른 시작**: `QUICK_START.md`
- **전체 가이드**: `DEPLOYMENT.md`

간단 요약:
```bash
# 1. GitHub에 푸시
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/news-site.git
git push -u origin main

# 2. GCP VM에서
git clone https://github.com/your-username/news-site.git
cd news-site
./setup.sh  # 초기 설정
./deploy.sh # 배포
```

## 프로젝트 구조

```
news-site/
├── client/              # React 프론트엔드
│   ├── src/
│   │   ├── components/  # 레이아웃 등
│   │   ├── contexts/    # AuthContext
│   │   ├── pages/       # 페이지 컴포넌트
│   │   └── App.jsx      # 라우팅
│   └── package.json
├── server/              # Node.js 백엔드
│   ├── src/
│   │   ├── database/    # DB 스키마
│   │   ├── middleware/  # 인증
│   │   ├── routes/      # API 라우트
│   │   └── index.js
│   ├── .env             # 환경 변수 (gitignore)
│   └── package.json
├── setup.sh             # 초기 설정 스크립트
├── deploy.sh            # 배포 스크립트
└── DEPLOYMENT.md        # 배포 가이드
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 기사
- `GET /api/articles` - 기사 목록
- `GET /api/articles/:id` - 기사 상세
- `POST /api/articles` - 기사 작성 (관리자)
- `PUT /api/articles/:id` - 기사 수정 (관리자)
- `DELETE /api/articles/:id` - 기사 삭제 (관리자)

### 댓글
- `GET /api/articles/:id/comments` - 댓글 목록
- `POST /api/articles/:id/comments` - 댓글 작성
- `DELETE /api/comments/:id` - 댓글 삭제

### 카테고리
- `GET /api/categories` - 카테고리 목록
- `GET /api/categories/:id/articles` - 카테고리별 기사

### 검색
- `GET /api/search?q=검색어` - 기사 검색

## 환경 변수

`server/.env` 파일 생성:
```env
PORT=5000
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

**주의**: `.env` 파일은 GitHub에 올리지 마세요!

## 관리자 계정

1. 웹사이트에서 일반 회원가입
2. 데이터베이스에서 권한 변경:
```bash
sqlite3 server/database.sqlite
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
.quit
```

## 라이선스

ISC
