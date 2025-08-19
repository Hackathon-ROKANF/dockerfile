@echo off
REM Docker Hub 배포 스크립트 (Windows)
REM 사용법: deploy.bat [태그명]

setlocal EnableDelayedExpansion

REM 설정 변수
set DOCKER_IMAGE_NAME=neogul02/knock-be
set TAG=%1
if "%TAG%"=="" set TAG=latest
set FULL_IMAGE_NAME=%DOCKER_IMAGE_NAME%:%TAG%

echo 🚀 Knock-BE Docker 배포 시작...
echo 이미지명: %FULL_IMAGE_NAME%

REM 1. Docker 이미지 빌드
echo 📦 Docker 이미지 빌드 중...
docker build -t %FULL_IMAGE_NAME% .

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker 이미지 빌드 실패
    exit /b 1
)

echo ✅ Docker 이미지 빌드 성공

REM 2. Docker Hub 로그인 확인
echo 🔐 Docker Hub 로그인 확인...
d%ERRORLEVEL% NEQ 0 (
     echo Docker Hub 로그인이 필요합니다.
     docker loginocker info | findstr Username >nul
if
)

REM 3. Docker Hub에 이미지 푸시
echo 📤 Docker Hub에 이미지 푸시 중...
docker push %FULL_IMAGE_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker 이미지 푸시 실패
    exit /b 1
)

echo ✅ Docker 이미지 푸시 성공
echo 🎉 배포 완료!
echo VM에서 다음 명령어로 실행 가능:
echo    docker pull %FULL_IMAGE_NAME%
echo    docker run -d -p 8080:8080 --name knock-be %FULL_IMAGE_NAME%

pause
