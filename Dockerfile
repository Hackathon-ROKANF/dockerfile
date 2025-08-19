# Playwright 공식 이미지를 기반으로 한 Ubuntu 환경
FROM mcr.microsoft.com/playwright/java:v1.45.0-jammy

# 작업 디렉토리 설정
WORKDIR /app

# 환경 변수 설정 (패키지 설치 시 interactive 프롬프트 방지)
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
ENV PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true

# Java 환경 변수 설정
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

# 시스템 업데이트 및 필수 패키지 설치 (단계별로 분리)
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    openjdk-17-jdk \
    maven \
    curl \
    wget \
    ca-certificates \
    tzdata \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 추가 폰트 설치 (선택적)
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    fonts-liberation \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 타임존 설정
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Maven 의존성 캐싱을 위한 pom.xml 먼저 복사
COPY pom.xml ./

# Maven 의존성 다운로드 (캐싱 최적화)
RUN mvn dependency:go-offline -B

# 소스 코드 복사
COPY src ./src

# 애플리케이션 빌드
RUN mvn clean package -DskipTests -B

# Playwright 브라우저 설치 (간소화된 방식)
RUN npx --yes playwright@1.45.0 install chromium

# 브라우저 권한 설정
RUN mkdir -p /ms-playwright && \
    chmod -R 755 /ms-playwright

# 애플리케이션 사용자 생성
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app && \
    chown -R appuser:appuser /ms-playwright

# 포트 노출
EXPOSE 3000

# 메모리 최적화를 위한 JVM 옵션 설정
ENV JAVA_OPTS="-Xmx768m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 프로덕션 프로파일 활성화
ENV SPRING_PROFILES_ACTIVE=prod

# 애플리케이션 실행 사용자 변경
USER appuser

# 애플리케이션 실행
CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/target/getprice-0.0.1-SNAPSHOT.jar"]
