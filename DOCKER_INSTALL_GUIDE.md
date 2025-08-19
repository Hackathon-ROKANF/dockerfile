# Docker 설치 및 설정 가이드 (Windows)

## 🐳 Docker Desktop 설치

### 1. Docker Desktop 다운로드 및 설치

1. **Docker Desktop 다운로드**
   - 공식 사이트: https://www.docker.com/products/docker-desktop/
   - "Download for Windows" 클릭
   - 또는 직접 링크: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **시스템 요구사항 확인**
   - Windows 10 64-bit: Pro, Enterprise, Education (Build 19041 이상)
   - Windows 11 64-bit: Home, Pro, Enterprise, Education
   - WSL 2 기능 활성화 필요

3. **설치 과정**
   - 다운로드한 `Docker Desktop Installer.exe` 실행
   - "Use WSL 2 instead of Hyper-V" 옵션 선택 (권장)
   - 설치 완료 후 컴퓨터 재시작

### 2. WSL 2 설정 (필요한 경우)

만약 WSL 2가 설치되지 않았다면:

1. **PowerShell을 관리자 권한으로 실행**
2. **다음 명령어 실행:**
   ```powershell
   # WSL 기능 활성화
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   
   # Virtual Machine Platform 기능 활성화
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   
   # 컴퓨터 재시작
   Restart-Computer
   ```

3. **WSL 2 Linux 커널 업데이트 패키지 설치**
   - 다운로드: https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
   - 다운로드한 파일 실행하여 설치

4. **WSL 2를 기본 버전으로 설정**
   ```powershell
   wsl --set-default-version 2
   ```

### 3. Docker Desktop 설정 확인

1. **Docker Desktop 실행**
   - 시작 메뉴에서 "Docker Desktop" 검색 후 실행
   - 첫 실행 시 약간의 시간이 소요됩니다

2. **설정 확인**
   - Docker Desktop이 실행되면 시스템 트레이에 Docker 아이콘이 나타납니다
   - 아이콘을 클릭하여 "Docker Desktop is running" 메시지 확인

3. **터미널에서 Docker 명령어 테스트**
   ```cmd
   docker --version
   docker run hello-world
   ```

## 🚀 설치 완료 후 배포 실행

Docker 설치가 완료되면 다음과 같이 배포를 진행하세요:

### 1. Docker Desktop이 실행 중인지 확인
- 시스템 트레이에서 Docker 아이콘 확인
- "Docker Desktop is running" 상태여야 함

### 2. 배포 스크립트의 Docker Hub 사용자명 변경
배포하기 전에 스크립트에서 `your-dockerhub-username`을 실제 Docker Hub 사용자명으로 변경해야 합니다.

#### Docker Hub 계정 생성 (없는 경우)
1. https://hub.docker.com/ 방문
2. "Sign Up" 클릭하여 계정 생성
3. 사용자명 기억해두기

#### 배포 스크립트 수정
- `deploy.bat` 파일의 3번째 줄 수정:
  ```bat
  set DOCKER_IMAGE_NAME=실제사용자명/knock-be
  ```

### 3. Docker Hub 로그인
```cmd
docker login
```
- Docker Hub 사용자명과 비밀번호 입력

### 4. 배포 실행
```cmd
# 최신 버전으로 배포
./deploy.bat

# 특정 태그로 배포
./deploy.bat v1.0.0
```

## 🛠️ 문제 해결

### Docker Desktop 실행 오류
- **Hyper-V 관련 오류**: BIOS에서 가상화 기능 활성화
- **WSL 2 관련 오류**: 위의 WSL 2 설정 단계 재실행
- **메모리 부족**: Docker Desktop 설정에서 메모리 할당량 조정

### 권한 관련 오류
- PowerShell이나 CMD를 관리자 권한으로 실행
- Windows Defender나 백신 프로그램에서 Docker 예외 처리

### 네트워크 관련 오류
- 방화벽에서 Docker Desktop 허용
- 회사 네트워크인 경우 프록시 설정 필요할 수 있음

## 📞 추가 도움

Docker 설치나 설정에 문제가 있다면:
1. Docker 공식 문서: https://docs.docker.com/desktop/windows/install/
2. Docker Desktop 설정에서 "Troubleshoot" 메뉴 활용
3. Windows 이벤트 로그에서 Docker 관련 오류 확인
