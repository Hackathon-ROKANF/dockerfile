#!/bin/bash

# BDS Crawler Docker 빌드 및 실행 스크립트

set -e

echo "🐳 BDS Crawler Docker 설정 중..."

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "❌ package.json을 찾을 수 없습니다. 프로젝트 루트에서 실행해주세요."
    exit 1
fi

# Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -t bds-crawler:latest --target production .

# 기존 컨테이너 정리 (있다면)
echo "🧹 기존 컨테이너 정리 중..."
docker stop bds-crawler 2>/dev/null || true
docker rm bds-crawler 2>/dev/null || true

# 컨테이너 실행
echo "🚀 컨테이너 실행 중..."
docker run -d \
  --name bds-crawler \
  -p 3001:3001 \
  --restart unless-stopped \
  bds-crawler:latest

# 컨테이너 상태 확인
echo "⏳ 컨테이너 시작 대기 중..."
sleep 10

# 헬스체크
echo "🏥 헬스체크 실행 중..."
if curl -f http://localhost:3001/api/bds > /dev/null 2>&1; then
    echo "✅ BDS Crawler가 성공적으로 시작되었습니다!"
    echo "📋 API 문서: http://localhost:3001/api/bds"
    echo "🏠 가격 조회 예시: http://localhost:3001/api/bds/lowest?address=생연로10"
else
    echo "❌ 헬스체크 실패. 로그를 확인해주세요:"
    docker logs bds-crawler
    exit 1
fi

echo "🎉 설정 완료!"
