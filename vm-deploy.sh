#!/bin/bash

# VM에서 Knock-BE 애플리케이션 배포 및 실행 스크립트
# 사용법: ./vm-deploy.sh [태그명]

set -e

# 설정 변수
DOCKER_IMAGE_NAME="your-dockerhub-username/knock-be"
TAG=${1:-latest}
FULL_IMAGE_NAME="${DOCKER_IMAGE_NAME}:${TAG}"
CONTAINER_NAME="knock-be"
PORT="8080"

echo "🚀 VM에서 Knock-BE 배포 시작..."
echo "이미지명: ${FULL_IMAGE_NAME}"

# 1. 기존 컨테이너 중지 및 삭제
echo "🛑 기존 컨테이너 정리 중..."
if docker ps -q -f name=${CONTAINER_NAME} | grep -q .; then
    echo "기존 컨테이너 중지 중..."
    docker stop ${CONTAINER_NAME}
fi

if docker ps -aq -f name=${CONTAINER_NAME} | grep -q .; then
    echo "기존 컨테이너 삭제 중..."
    docker rm ${CONTAINER_NAME}
fi

# 2. 최신 이미지 풀
echo "📥 Docker Hub에서 최신 이미지 풀 중..."
docker pull ${FULL_IMAGE_NAME}

# 3. 새 컨테이너 실행
echo "🚀 새 컨테이너 실행 중..."
docker run -d \
    --name ${CONTAINER_NAME} \
    -p ${PORT}:8080 \
    --restart unless-stopped \
    -e SPRING_PROFILES_ACTIVE=prod \
    ${FULL_IMAGE_NAME}

# 4. 컨테이너 상태 확인
echo "⏳ 컨테이너 시작 대기 중..."
sleep 10

if docker ps | grep -q ${CONTAINER_NAME}; then
    echo "✅ 컨테이너가 성공적으로 실행되었습니다!"
    echo "🌐 애플리케이션 접속 URL: http://localhost:${PORT}"
    echo "📊 Swagger UI: http://localhost:${PORT}/swagger-ui/index.html"
    echo ""
    echo "📋 유용한 명령어들:"
    echo "   로그 확인: docker logs -f ${CONTAINER_NAME}"
    echo "   컨테이너 중지: docker stop ${CONTAINER_NAME}"
    echo "   컨테이너 재시작: docker restart ${CONTAINER_NAME}"
else
    echo "❌ 컨테이너 실행에 실패했습니다."
    echo "📋 로그 확인:"
    docker logs ${CONTAINER_NAME}
    exit 1
fi
