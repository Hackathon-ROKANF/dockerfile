#!/bin/bash

# Docker Hub 배포 스크립트
# 사용법: ./deploy.sh [태그명]

set -e

# 설정 변수
DOCKER_IMAGE_NAME="your-dockerhub-username/knock-be"
TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE_NAME}:${TAG}"

echo "🚀 Knock-BE Docker 배포 시작..."
echo "이미지명: ${FULL_IMAGE_NAME}"

# 1. Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker build -t ${FULL_IMAGE_NAME} .

# 2. 빌드 성공 확인
if [ $? -eq 0 ]; then
    echo "✅ Docker 이미지 빌드 성공"
else
    echo "❌ Docker 이미지 빌드 실패"
    exit 1
fi

# 3. Docker Hub에 로그인 (이미 로그인되어 있지 않은 경우)
echo "🔐 Docker Hub 로그인 확인..."
docker info | grep Username || docker login

# 4. Docker Hub에 이미지 푸시
echo "📤 Docker Hub에 이미지 푸시 중..."
docker push ${FULL_IMAGE_NAME}

# 5. 푸시 성공 확인
if [ $? -eq 0 ]; then
    echo "✅ Docker 이미지 푸시 성공"
    echo "🎉 배포 완료!"
    echo "VM에서 다음 명령어로 실행 가능:"
    echo "   docker pull ${FULL_IMAGE_NAME}"
    echo "   docker run -d -p 8080:8080 --name knock-be ${FULL_IMAGE_NAME}"
else
    echo "❌ Docker 이미지 푸시 실패"
    exit 1
fi
