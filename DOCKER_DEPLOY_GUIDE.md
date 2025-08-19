# Knock-BE Docker 배포 가이드

## 개요
이 프로젝트는 Spring Boot + Playwright를 사용하는 부동산 크롤링 애플리케이션입니다. 
배포 환경에서 Playwright가 안정적으로 동작하도록 Docker 컨테이너화되어 있습니다.

## 🚀 빠른 시작

### 1. Docker Hub 배포

#### Windows 환경
```bash
# Docker 이미지 빌드 및 푸시
./deploy.bat

# 특정 태그로 배포
./deploy.bat v1.0.0
```

#### Linux/Mac 환경
```bash
# 실행 권한 부여
chmod +x deploy.sh

# Docker 이미지 빌드 및 푸시
./deploy.sh

# 특정 태그로 배포
./deploy.sh v1.0.0
```

### 2. VM에서 애플리케이션 실행

```bash
# 실행 권한 부여
chmod +x vm-deploy.sh

# 최신 버전 배포
./vm-deploy.sh

# 특정 버전 배포
./vm-deploy.sh v1.0.0
```

## 📦 수동 Docker 명령어

### 로컬에서 빌드 및 실행
```bash
# 이미지 빌드
docker build -t knock-be .

# 컨테이너 실행
docker run -d -p 8080:8080 --name knock-be knock-be
```

### Docker Hub 사용
```bash
# 이미지 풀
docker pull your-dockerhub-username/knock-be:latest

# 컨테이너 실행
docker run -d \
  --name knock-be \
  -p 8080:8080 \
  --restart unless-stopped \
  -e SPRING_PROFILES_ACTIVE=prod \
  your-dockerhub-username/knock-be:latest
```

## 🔧 설정 변경

### Docker Hub 사용자명 변경
배포 스크립트에서 `your-dockerhub-username`을 실제 Docker Hub 사용자명으로 변경하세요:

1. `deploy.sh` 파일의 `DOCKER_IMAGE_NAME` 변수 수정
2. `deploy.bat` 파일의 `DOCKER_IMAGE_NAME` 변수 수정
3. `vm-deploy.sh` 파일의 `DOCKER_IMAGE_NAME` 변수 수정

### 환경 변수 설정
프로덕션 환경에서 다음 환경 변수를 설정할 수 있습니다:

```bash
# Spring Profile
-e SPRING_PROFILES_ACTIVE=prod

# 서버 포트 (기본값: 8080)
-e SERVER_PORT=8080

# Playwright 설정 (Docker 환경에서 자동 설정됨)
-e PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
-e PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
```

## 🛠️ 문제 해결

### 1. Playwright 브라우저 관련 오류
Docker 컨테이너는 Microsoft의 공식 Playwright 이미지를 기반으로 하여 브라우저가 사전 설치되어 있습니다.
만약 브라우저 관련 오류가 발생하면:

```bash
# 컨테이너 로그 확인
docker logs knock-be

# 컨테이너 내부 확인
docker exec -it knock-be /bin/bash
ls -la /ms-playwright/
```

### 2. 메모리 부족 오류
메모리가 부족한 환경에서는 다음 옵션을 추가하세요:

```bash
docker run -d \
  --name knock-be \
  -p 8080:8080 \
  --memory=2g \
  --memory-swap=2g \
  your-dockerhub-username/knock-be:latest
```

### 3. 네트워크 연결 문제
방화벽이나 네트워크 정책으로 인한 문제가 있을 경우:

```bash
# 컨테이너에서 외부 연결 테스트
docker exec -it knock-be curl -I https://www.budongsan114.com
```

## 📊 모니터링

### 애플리케이션 상태 확인
- 기본 URL: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- 헬스체크: `http://localhost:8080/actuator/health` (설정된 경우)

### 유용한 Docker 명령어
```bash
# 컨테이너 상태 확인
docker ps

# 로그 실시간 확인
docker logs -f knock-be

# 컨테이너 재시작
docker restart knock-be

# 컨테이너 중지
docker stop knock-be

# 컨테이너 삭제
docker rm knock-be

# 이미지 삭제
docker rmi your-dockerhub-username/knock-be:latest
```

## 🔄 CI/CD 통합

GitHub Actions나 Jenkins와 같은 CI/CD 도구와 통합하려면 다음과 같이 사용할 수 있습니다:

```yaml
# GitHub Actions 예시
- name: Build and Push Docker Image
  run: |
    docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/knock-be:${{ github.sha }} .
    docker push ${{ secrets.DOCKERHUB_USERNAME }}/knock-be:${{ github.sha }}

- name: Deploy to VM
  run: |
    ssh user@your-vm "docker pull ${{ secrets.DOCKERHUB_USERNAME }}/knock-be:${{ github.sha }}"
    ssh user@your-vm "docker stop knock-be || true"
    ssh user@your-vm "docker rm knock-be || true"
    ssh user@your-vm "docker run -d --name knock-be -p 8080:8080 ${{ secrets.DOCKERHUB_USERNAME }}/knock-be:${{ github.sha }}"
```

## 📝 주요 개선사항

1. **Playwright 최적화**: Microsoft 공식 Playwright 이미지 사용으로 브라우저 호환성 개선
2. **헤드리스 모드 강화**: 배포 환경에 최적화된 브라우저 옵션 설정
3. **환경 감지**: Docker 컨테이너 환경을 자동으로 감지하여 적절한 설정 적용
4. **메모리 최적화**: 제한된 메모리 환경에서도 안정적으로 동작하도록 설정
5. **로깅 개선**: 배포 환경에서의 디버깅을 위한 상세한 로그 출력

이제 배포 환경에서도 Playwright가 안정적으로 동작하여 크롤링 기능이 정상적으로 작동할 것입니다.
