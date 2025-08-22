# BDS Crawler

부동산 가격 정보를 크롤링하는 Node.js API 서버입니다.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드로 실행
npm run dev

# 프로덕션 모드로 실행
npm start
```

## API 사용법

### 주소별 최저가 조회

```
GET /api/bds/lowest?address={주소}
```

**예시 요청:**

```
GET http://localhost:3000/api/bds/lowest?address=생연로10
```

**응답 예시:**

```json
{
  "주소": "생연로10",
  "매매가": 290000000,
  "전세가": 220000000,
  "sourceUrl": "https://www.bdsplanet.com/map/realprice_map/LAQPqnbaiuE/N/A/1/90.17.ytp"
}
```

## 주의사항

1. 이 코드는 웹 크롤링을 사용합니다. 대상 웹사이트의 이용약관을 확인하세요.
2. 실제 운영시에는 요청 간격을 두어 서버에 부하를 주지 않도록 하세요.
3. 웹사이트 구조가 변경되면 크롤링 로직을 수정해야 할 수 있습니다.

## 기술 스택

- Node.js
- Express.js
- Axios (HTTP 클라이언트)
- Cheerio (HTML 파싱)
- CORS (크로스 오리진 요청 지원)

## 개발 모드

개발 모드에서는 nodemon을 사용하여 파일 변경시 자동으로 서버가 재시작됩니다.

```bash
npm run dev
```
