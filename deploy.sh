#!/bin/bash

# 뉴스 사이트 배포 스크립트
# GCP Compute Engine에서 사용

echo "====================================="
echo "뉴스 사이트 배포 시작"
echo "====================================="

# 1. 최신 코드 가져오기
echo "1. GitHub에서 최신 코드 가져오기..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull 실패"
    exit 1
fi

# 2. 의존성 설치
echo "2. 의존성 설치 중..."
npm run install-all

if [ $? -ne 0 ]; then
    echo "❌ 의존성 설치 실패"
    exit 1
fi

# 3. 프론트엔드 빌드
echo "3. 프론트엔드 빌드 중..."
cd client
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 프론트엔드 빌드 실패"
    exit 1
fi

cd ..

# 4. 백엔드 재시작
echo "4. 백엔드 재시작 중..."
pm2 restart news-site-api

if [ $? -ne 0 ]; then
    echo "⚠️  PM2가 설치되어 있지 않거나 앱이 실행 중이지 않습니다"
    echo "다음 명령어로 실행하세요:"
    echo "  cd server && pm2 start src/index.js --name news-site-api"
fi

# 5. Nginx 재시작
echo "5. Nginx 재시작 중..."
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    echo "⚠️  Nginx 재시작 실패"
fi

echo "====================================="
echo "✅ 배포 완료!"
echo "====================================="
echo ""
echo "서비스 상태 확인:"
echo "  pm2 status"
echo "  sudo systemctl status nginx"
echo ""
echo "로그 확인:"
echo "  pm2 logs news-site-api"
