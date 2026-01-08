#!/bin/bash

# GCP Compute Engine 초기 설정 스크립트
# VM에서 처음 실행할 때 사용

echo "====================================="
echo "GCP Compute Engine 초기 설정"
echo "====================================="

# 1. 시스템 업데이트
echo "1. 시스템 업데이트 중..."
sudo apt-get update
sudo apt-get upgrade -y

# 2. Node.js 설치
echo "2. Node.js 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Node.js 버전: $(node --version)"
echo "NPM 버전: $(npm --version)"

# 3. Git 설치
echo "3. Git 설치 중..."
sudo apt-get install -y git

# 4. PM2 설치
echo "4. PM2 설치 중..."
sudo npm install -g pm2

# 5. Nginx 설치
echo "5. Nginx 설치 중..."
sudo apt-get install -y nginx

# 6. 방화벽 설정
echo "6. UFW 방화벽 설정 중..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

echo "====================================="
echo "✅ 초기 설정 완료!"
echo "====================================="
echo ""
echo "다음 단계:"
echo "1. GitHub에서 프로젝트 클론:"
echo "   git clone https://github.com/your-username/news-site.git"
echo ""
echo "2. 프로젝트 디렉토리로 이동:"
echo "   cd news-site"
echo ""
echo "3. 환경 변수 설정:"
echo "   nano server/.env"
echo ""
echo "4. 의존성 설치:"
echo "   npm run install-all"
echo ""
echo "5. 프론트엔드 빌드:"
echo "   cd client && npm run build && cd .."
echo ""
echo "6. 백엔드 실행:"
echo "   cd server && pm2 start src/index.js --name news-site-api"
echo ""
echo "7. Nginx 설정:"
echo "   sudo nano /etc/nginx/sites-available/news-site"
echo "   (DEPLOYMENT.md 참고)"
