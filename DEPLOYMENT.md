# BDS Crawler - 클라우드 배포 가이드

## 🚀 배포 준비

### Docker Hub에 이미지 푸시

```bash
# 이미지 태그
docker tag bds-crawler:latest yourusername/bds-crawler:latest

# Docker Hub에 푸시
docker push yourusername/bds-crawler:latest
```

### 클라우드 플랫폼별 배포

#### 1. Railway

```bash
# Railway CLI 설치 후
railway login
railway init
railway up
```

#### 2. Render

- GitHub 저장소 연결
- Dockerfile 자동 감지
- 포트 3000 설정

#### 3. Fly.io

```bash
# Fly CLI 설치 후
flyctl launch
flyctl deploy
```

#### 4. Google Cloud Run

```bash
# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/PROJECT-ID/bds-crawler

# 배포
gcloud run deploy --image gcr.io/PROJECT-ID/bds-crawler --platform managed
```

#### 5. AWS Elastic Container Service (ECS)

- ECR에 이미지 푸시
- ECS 서비스 생성
- ALB 설정

## 🔧 환경 변수

배포시 설정할 환경 변수:

- `NODE_ENV=production`
- `PORT=3000` (클라우드에서 자동 설정되는 경우가 많음)

## 📊 리소스 요구사항

- **메모리**: 최소 512MB, 권장 1GB
- **CPU**: 최소 0.25 vCPU, 권장 0.5 vCPU
- **스토리지**: 최소 1GB
- **네트워크**: HTTP/HTTPS 포트 개방 필요

## 🔍 모니터링

헬스체크 엔드포인트: `/api/bds`

- 서버 상태 확인
- 자동 재시작 트리거
