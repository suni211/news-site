# 빠른 시작 가이드

## GitHub에 업로드하기

### 1. 로컬에서 Git 설정
```bash
cd news-site
git init
git add .
git commit -m "Initial commit: News site project"
```

### 2. GitHub 저장소 생성
1. https://github.com/new 접속
2. 저장소 이름: `news-site` (원하는 이름으로)
3. Private 또는 Public 선택
4. README, .gitignore 추가 안 함 (이미 있음)
5. Create repository 클릭

### 3. GitHub에 푸시
```bash
git remote add origin https://github.com/당신의유저명/news-site.git
git branch -M main
git push -u origin main
```

## GCP Compute Engine에서 실행하기

### VM에 처음 접속했을 때 (한 번만 실행)

```bash
# 1. 초기 설정 스크립트 다운로드 및 실행
wget https://raw.githubusercontent.com/당신의유저명/news-site/main/setup.sh
chmod +x setup.sh
./setup.sh
```

또는 수동으로:

```bash
# Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2, Nginx 설치
sudo npm install -g pm2
sudo apt-get install -y nginx git
```

### 프로젝트 설정

```bash
# 1. GitHub에서 클론
git clone https://github.com/당신의유저명/news-site.git
cd news-site

# 2. 환경 변수 설정
nano server/.env
# 다음 내용 입력:
# PORT=5000
# JWT_SECRET=여기에-긴-랜덤-문자열-입력
# NODE_ENV=production

# 3. 의존성 설치
npm run install-all

# 4. 프론트엔드 빌드
cd client
npm run build
cd ..

# 5. 백엔드 실행
cd server
pm2 start src/index.js --name news-site-api
pm2 save
pm2 startup  # 나오는 명령어 복사해서 실행
cd ..
```

### Nginx 설정

```bash
# 1. 설정 파일 생성
sudo nano /etc/nginx/sites-available/news-site
```

다음 내용 붙여넣기 (your-username을 실제 사용자명으로 변경):
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /home/your-username/news-site/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 2. Nginx 활성화
sudo ln -s /etc/nginx/sites-available/news-site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 방화벽 설정 (GCP Console에서)
1. GCP Console → VPC 네트워크 → 방화벽
2. 방화벽 규칙 만들기
   - 이름: allow-http
   - 대상: 네트워크의 모든 인스턴스
   - 소스 IP 범위: 0.0.0.0/0
   - 프로토콜 및 포트: tcp:80

## 접속 확인

브라우저에서:
```
http://VM의-외부-IP
```

## 업데이트 방법

코드를 수정하고 GitHub에 푸시한 후:

```bash
cd ~/news-site
./deploy.sh
```

또는 수동으로:
```bash
git pull
npm run install-all
cd client && npm run build && cd ..
pm2 restart news-site-api
sudo systemctl restart nginx
```

## 관리자 계정 만들기

```bash
cd ~/news-site/server
sqlite3 database.sqlite
```

SQLite에서:
```sql
-- 먼저 웹사이트에서 회원가입 후
UPDATE users SET role = 'admin' WHERE email = '당신의이메일@example.com';
.quit
```

## 유용한 명령어

```bash
# 서비스 상태 확인
pm2 status
sudo systemctl status nginx

# 로그 확인
pm2 logs news-site-api
sudo tail -f /var/log/nginx/error.log

# 서비스 재시작
pm2 restart news-site-api
sudo systemctl restart nginx
```

## 문제 해결

### "Connection refused" 오류
```bash
pm2 status  # 백엔드가 실행 중인지 확인
pm2 logs news-site-api  # 에러 로그 확인
```

### Nginx 오류
```bash
sudo nginx -t  # 설정 파일 테스트
sudo systemctl status nginx
```

### 포트 충돌
```bash
sudo lsof -i :5000
sudo kill -9 [PID]
```

더 자세한 내용은 `DEPLOYMENT.md`를 참고하세요!
