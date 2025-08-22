# Playwright 공식 이미지 사용 (모든 브라우저와 의존성 사전 설치됨)
FROM mcr.microsoft.com/playwright:v1.55.0-jammy AS builder

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# 프로덕션 스테이지
FROM mcr.microsoft.com/playwright:v1.55.0-jammy AS production

ENV NODE_ENV=production
WORKDIR /app

# 런타임 의존성만 설치 (playwright 포함)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 빌드된 파일과 필요한 파일들 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/addressMap.json ./
COPY --from=builder /app/healthcheck.js ./

# 비 root 사용자로 실행 (이미지에 pwuser가 사전 정의됨)
USER pwuser

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 애플리케이션 시작
CMD ["npm", "start"]
