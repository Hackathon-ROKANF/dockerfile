import axios from 'axios'

const BASE_URL = 'http://localhost:3000'

async function testAPI() {
  console.log('🧪 BDS Planet API 테스트 시작\n')

  try {
    // 1. API 정보 확인
    console.log('1️⃣ API 정보 확인')
    console.log('='.repeat(50))
    const infoResponse = await axios.get(`${BASE_URL}/api/bds`)
    console.log('✅ API 정보:', JSON.stringify(infoResponse.data, null, 2))

    // 2. 생연로10 가격 조회 테스트
    console.log('\n\n2️⃣ 생연로10 가격 조회 테스트')
    console.log('='.repeat(50))

    const testUrl = `${BASE_URL}/api/bds/lowest?address=생연로10`
    console.log(`📞 요청 URL: ${testUrl}`)

    const response = await axios.get(testUrl, { timeout: 60000 })

    console.log('✅ 응답 데이터:')
    console.log(JSON.stringify(response.data, null, 2))

    // 예상 결과와 비교
    const data = response.data
    if (data.주소 === '생연로10' && data.매매가 && data.전세가) {
      console.log('🎉 테스트 성공!')
    } else {
      console.log('❌ 예상과 다른 결과')
    }
  } catch (error: any) {
    if (error.response) {
      console.error('❌ HTTP 오류:', error.response.status, error.response.data)
    } else {
      console.error('❌ 네트워크 오류:', error.message)
    }
  }

  console.log('\n🏁 API 테스트 완료!')
}

// 서버가 시작될 때까지 잠시 대기
setTimeout(testAPI, 3000)
