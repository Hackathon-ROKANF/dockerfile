# Cloudtype Playwright 배포 가이드

## 🎯 문제 해결

기존 배포 환경에서 Playwright 크롤링이 실패하던 문제를 해결하기 위해 **Docker 기반 배포**로 전환합니다.

### 문제 원인
- Cloudtype 기본 Node.js/Java 템플릿에는 브라우저 바이너리와 시스템 의존성이 없음
- `npx playwright install --with-deps` 명령어가 실행되지 않아 Chromium 브라우저 미설치
- 시스템 라이브러리 (libnss3, libgtk, fonts 등) 부족

## 🔧 해결 방법

### 1. Dockerfile 기반 배포

현재 프로젝트에 포함된 `Dockerfile`을 사용하여 배포합니다.

**주요 특징:**
- Microsoft Playwright 공식 이미지 기반 (`mcr.microsoft.com/playwright/java:v1.45.0-jammy`)
- Ubuntu 22.04 환경에서 Java 17 + Maven 완전 설정
- Chromium 브라우저 + 모든 시스템 의존성 자동 설치
- 한국어 폰트 포함 (네이버 등 한국 사이트 크롤링 최적화)

### 2. Cloudtype 배포 설정

#### Step 1: 프로젝트 설정
1. Cloudtype 대시보드 → 새 프로젝트 생성
2. **빌드 방식**: "Dockerfile" 선택 ⚠️ 중요!
3. **Git 연결**: 현재 프로젝트 저장소 연결

#### Step 2: 환경 변수 설정
```bash
PORT=3000
SPRING_PROFILES_ACTIVE=prod
JAVA_OPTS=-Xmx1g -Xms512m
```

#### Step 3: 배포 확인
- 빌드 시간: 약 5-10분 (브라우저 설치 포함)
- 메모리 사용량: 약 1GB (브라우저 실행 시)
- 헬스체크: `GET /api/bds/lowest?address=test`

## 📋 배포 후 테스트

### API 테스트
```bash
# 크롤링 테스트
curl "https://your-app.cloudtype.app/api/bds/lowest?address=서울시 강남구"

# 정상 응답 예시
{
  "address": "서울시 강남구",
  "sourceUrl": "https://www.bdsplanet.com/...",
  "saleLowestWon": 50000000000,
  "jeonseLowestWon": 30000000000,
  "wolseDepositLowestWon": null,
  "wolseMonthlyLowestWon": null
}
```

### 로그 확인
```bash
# Cloudtype 콘솔에서 확인할 로그
[INFO] Playwright 초기화 성공
[INFO] 브라우저 실행 시도 - 헤드리스 모드
[INFO] 검색 완료 URL: https://www.bdsplanet.com/...
[INFO] 매매 가격 추출 성공 (JSON): 50000000000
```

## 🚨 트러블슈팅

### 빌드 실패 시
```bash
# 문제: Maven 의존성 다운로드 실패
# 해결: Cloudtype에서 빌드 재시도

# 문제: Playwright 브라우저 설치 실패
# 해결: Dockerfile의 npx 명령어 확인
```

### 런타임 오류 시
```bash
# 문제: "browser executable not found"
# 원인: Dockerfile 빌드가 Node.js 템플릿으로 설정됨
# 해결: Cloudtype 설정에서 "Dockerfile" 빌드 방식 재확인

# 문제: Memory limit exceeded
# 해결: Cloudtype 플랜 업그레이드 (최소 1GB RAM 권장)
```

## 📊 성능 최적화

### 메모리 사용량
- 기본: ~512MB
- 브라우저 실행 시: ~1GB
- 다중 요청 시: ~1.5GB

### 응답 시간
- 첫 번째 크롤링: 10-15초 (브라우저 초기화)
- 이후 크롤링: 5-8초 (브라우저 재사용)

## 🔍 모니터링

### 헬스체크
- 경로: `GET /api/bds/lowest?address=test`
- 간격: 30초
- 타임아웃: 10초
- 재시도: 3회

### 로그 레벨
- 프로덕션: INFO
- 디버깅 필요 시: DEBUG (application-prod.properties 수정)

## 📝 참고사항

1. **첫 배포 시간**: 브라우저 다운로드로 인해 빌드 시간이 길 수 있습니다.
2. **메모리 요구사항**: 최소 1GB RAM 권장 (Cloudtype Standard 플랜 이상)
3. **네트워크**: 크롤링 대상 사이트의 접근 정책에 따라 차단될 수 있습니다.
4. **브라우저 업데이트**: Playwright 버전 업데이트 시 Dockerfile의 버전도 함께 수정 필요

---

✅ **배포 완료 체크리스트**
- [ ] Cloudtype에서 "Dockerfile" 빌드 방식 선택
- [ ] 환경 변수 설정 완료
- [ ] 빌드 성공 (5-10분 소요)
- [ ] API 테스트 통과
- [ ] 크롤링 결과 정상 반환 (null 값 없음)
