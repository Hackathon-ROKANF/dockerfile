# Playwright 공식 이미지를 기반으로 한 Ubuntu 환경
FROM mcr.microsoft.com/playwright/java:v1.45.0-jammy

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 설정 (패키지 설치 시 interactive 프롬프트 방지)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# 시스템 패키지 업데이트 및 필수 의존성 설치
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    # Java 17 설치
    openjdk-17-jdk \
    # Maven 설치
    maven \
    # 폰트 및 그래픽 라이브러리
    fonts-liberation \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-dejavu-core \
    fontconfig \
    # 추가 시스템 라이브러리 (Playwright 실행에 필요)
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgtk-3-0 \
    libgbm1 \
    libasound2 \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libpangocairo-1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxi6 \
    libxtst6 \
    # 시스템 유틸리티
    curl \
    wget \
    ca-certificates \
    tzdata \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 타임존 설정
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Java 환경 변수 설정
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# Playwright 환경 변수 설정
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
ENV PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true

# Maven 의존성 캐싱을 위한 pom.xml 먼저 복사
COPY pom.xml ./

# Maven 의존성 다운로드 (캐싱 최적화)
RUN mvn dependency:go-offline -B

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN mvn clean package -DskipTests -B

# Playwright 브라우저 설치 (Node.js 기반 CLI 사용)
RUN npx --yes playwright@1.45.0 install chromium --with-deps

# 브라우저 권한 설정 및 디렉토리 생성
RUN mkdir -p /ms-playwright && \
    chmod -R 755 /ms-playwright && \
    chmod -R 755 /root/.cache

# 애플리케이션 사용자 생성 (보안 강화)
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
RUN chown -R appuser:appuser /ms-playwright

# 포트 노출
EXPOSE 3000

# 메모리 최적화를 위한 JVM 옵션 설정
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -Djava.security.egd=file:/dev/./urandom"

# 프로덕션 프로파일 활성화
ENV SPRING_PROFILES_ACTIVE=prod

# 애플리케이션 실행 (보안을 위해 appuser로 실행)
USER appuser

# 헬스체크 추가 (간단한 포트 확인)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/bds/lowest?address=test || exit 1

# 애플리케이션 실행
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/target/getprice-0.0.1-SNAPSHOT.jar"]
