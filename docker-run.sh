#!/bin/bash

# BDS Crawler Docker 실행 스크립트

echo "🚀 BDS Crawler Docker 이미지 빌드 및 실행"
echo "========================================"

# 기존 컨테이너 중지 및 제거
echo "📦 기존 컨테이너 정리 중..."
docker stop bds-crawler 2>/dev/null || true
docker rm bds-crawler 2>/dev/null || true

# 이미지 빌드
echo "🔧 Docker 이미지 빌드 중..."
docker build -t bds-crawler:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker 이미지 빌드 실패"
    exit 1
fi

# 컨테이너 실행
echo "▶️ 컨테이너 실행 중..."
docker run -d \
    --name bds-crawler \
    --restart unless-stopped \
    -p 3000:3000 \
    --memory="1g" \
    --cpus="0.5" \
    bds-crawler:latest

if [ $? -eq 0 ]; then
    echo "✅ BDS Crawler 서버가 성공적으로 시작되었습니다!"
    echo "🌐 서버 주소: http://localhost:3000"
    echo "📊 API 엔드포인트: http://localhost:3000/api/bds"
    echo ""
    echo "📋 컨테이너 상태 확인:"
    docker ps --filter name=bds-crawler
    echo ""
    echo "📝 로그 확인: docker logs -f bds-crawler"
else
    echo "❌ 컨테이너 실행 실패"
    exit 1
fi
