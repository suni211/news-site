# GCP Compute Engine 배포 가이드

이 문서는 GitHub를 통해 GCP Compute Engine에 뉴스 사이트를 배포하는 방법을 설명합니다.

## 1. GitHub에 코드 업로드

### 1-1. Git 초기화 및 커밋
```bash
cd news-site
git init
git add .
git commit -m "Initial commit: News site project"
```

### 1-2. GitHub 저장소 생성 후 푸시
```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-username/news-site.git
git branch -M main
git push -u origin main
```

## 2. GCP Compute Engine 인스턴스 생성

### 2-1. GCP Console에서 VM 생성
1. GCP Console → Compute Engine → VM 인스턴스
2. 인스턴스 만들기 클릭
3. 권장 사양:
   - **머신 유형**: e2-small 이상 (최소 2GB RAM)
   - **부팅 디스크**: Ubuntu 22.04 LTS (20GB)
   - **방화벽**: HTTP, HTTPS 트래픽 허용 체크

### 2-2. 방화벽 규칙 추가
```bash
# GCP Console → VPC 네트워크 → 방화벽 규칙
# 새 규칙 만들기:
- 이름: allow-node-app
- 대상: 네트워크의 모든 인스턴스
- 소스 IP 범위: 0.0.0.0/0
- 프로토콜 및 포트: tcp:5000, tcp:5173 (개발용)
```

## 3. VM에 접속 및 환경 설정

### 3-1. SSH 접속
```bash
# GCP Console에서 SSH 버튼 클릭 또는
gcloud compute ssh your-instance-name --zone=your-zone
```

### 3-2. Node.js 설치
```bash
# Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 설치 확인
node --version
npm --version
```

### 3-3. Git 설치 (이미 설치되어 있을 수 있음)
```bash
sudo apt-get update
sudo apt-get install -y git
```

### 3-4. GitHub에서 코드 클론
```bash
cd ~
git clone https://github.com/your-username/news-site.git
cd news-site
```

## 4. 프로젝트 설정 및 실행

### 4-1. 환경 변수 설정
```bash
# server/.env 파일 생성
cd ~/news-site/server
nano .env
```

다음 내용 입력:
```env
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production-use-long-random-string
NODE_ENV=production
```

**중요**: JWT_SECRET은 반드시 강력한 랜덤 문자열로 변경하세요!

### 4-2. 의존성 설치
```bash
cd ~/news-site
npm run install-all
```

### 4-3. 프론트엔드 빌드
```bash
cd ~/news-site/client
npm run build
```

## 5. 프로덕션 실행 설정

### 5-1. PM2 설치 (프로세스 관리자)
```bash
sudo npm install -g pm2
```

### 5-2. 백엔드 실행
```bash
cd ~/news-site/server
pm2 start src/index.js --name "news-site-api"
```

### 5-3. 프론트엔드 서빙 (Nginx 사용)

#### Nginx 설치
```bash
sudo apt-get install -y nginx
```

#### Nginx 설정
```bash
sudo nano /etc/nginx/sites-available/news-site
```

다음 내용 입력:
```nginx
server {
    listen 80;
    server_name your-vm-external-ip;  # 또는 도메인

    # 프론트엔드
    location / {
        root /home/your-username/news-site/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 프록시
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Nginx 활성화
```bash
sudo ln -s /etc/nginx/sites-available/news-site /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 5-4. PM2 자동 시작 설정
```bash
pm2 startup
pm2 save
```

## 6. 접속 확인

브라우저에서 접속:
```
http://your-vm-external-ip
```

## 7. 관리 명령어

### 로그 확인
```bash
# 백엔드 로그
pm2 logs news-site-api

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 서비스 재시작
```bash
# 백엔드 재시작
pm2 restart news-site-api

# Nginx 재시작
sudo systemctl restart nginx
```

### 코드 업데이트
```bash
cd ~/news-site
git pull
npm run install-all

# 프론트엔드 재빌드
cd client
npm run build

# 백엔드 재시작
pm2 restart news-site-api
```

### PM2 상태 확인
```bash
pm2 status
pm2 monit
```

## 8. 관리자 계정 생성

```bash
cd ~/news-site/server
sqlite3 database.sqlite

# SQLite에서 실행
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
.quit
```

## 9. SSL 인증서 설정 (선택사항)

도메인이 있다면 Let's Encrypt로 무료 SSL 인증서를 설정할 수 있습니다:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 10. 보안 권장사항

1. **방화벽 설정**: 필요한 포트만 열기
2. **JWT_SECRET**: 강력한 랜덤 문자열 사용
3. **데이터베이스 백업**: 정기적인 백업 설정
4. **SSL 인증서**: HTTPS 사용
5. **환경 변수**: .env 파일 절대 GitHub에 올리지 말 것

## 문제 해결

### 포트 이미 사용 중
```bash
sudo lsof -i :5000
sudo kill -9 PID
```

### 권한 오류
```bash
sudo chown -R $USER:$USER ~/news-site
```

### Nginx 오류
```bash
sudo nginx -t  # 설정 파일 테스트
sudo systemctl status nginx
```
