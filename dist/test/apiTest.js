"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// 실제 BDS Planet URL 테스트 데이터
const testCases = [
    {
        name: '신갈로68번길 26 (전월세 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/QaQjYjYnwuE/N/A/2/84.37.ytp',
    },
    {
        name: '신갈동 52-21 (매매 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/toK4P4wISwE/N/B/1/66.78.ytp',
    },
    {
        name: 'Z타입 (매매 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/V0N4P4wISwE/N/Z/1/0.ytp',
    },
];
async function testAPI() {
    console.log('🌐 BDS Planet API 테스트 시작\n');
    try {
        // 1. API 정보 확인
        console.log('1️⃣ API 정보 확인');
        console.log('='.repeat(50));
        const infoResponse = await axios_1.default.get(`${BASE_URL}/api/bds`);
        console.log('✅ API 정보:', JSON.stringify(infoResponse.data, null, 2));
        // 2. URL 쌍 생성 테스트
        console.log('\n\n2️⃣ URL 쌍 생성 테스트');
        console.log('='.repeat(50));
        for (const testCase of testCases) {
            console.log(`\n📋 테스트: ${testCase.name}`);
            console.log(`입력 URL: ${testCase.url}`);
            try {
                const response = await axios_1.default.get(`${BASE_URL}/api/bds/urlpair`, {
                    params: { currentUrl: testCase.url },
                });
                if (response.data.success) {
                    const data = response.data.data;
                    console.log(`✅ 매매 URL: ${data.saleUrl}`);
                    console.log(`✅ 전월세 URL: ${data.rentUrl}`);
                    console.log(`✅ 인코딩된 주소: ${data.encodedAddress}`);
                    console.log(`✅ 디코딩된 주소: ${data.decodedAddress || 'undefined'}`);
                    console.log(`🎉 성공!`);
                }
                else {
                    console.log(`❌ 실패: ${response.data.error}`);
                }
            }
            catch (error) {
                console.log(`❌ 오류: ${error.response?.data?.error || error.message}`);
            }
        }
        // 3. 반대 탭 URL 생성 테스트
        console.log('\n\n3️⃣ 반대 탭 URL 생성 테스트');
        console.log('='.repeat(50));
        for (const testCase of testCases) {
            console.log(`\n📋 테스트: ${testCase.name}`);
            console.log(`입력 URL: ${testCase.url}`);
            try {
                const response = await axios_1.default.get(`${BASE_URL}/api/bds/opposite`, {
                    params: { currentUrl: testCase.url },
                });
                if (response.data.success) {
                    const data = response.data.data;
                    console.log(`✅ 현재 URL: ${data.currentUrl}`);
                    console.log(`✅ 반대 탭 URL: ${data.oppositeUrl}`);
                    console.log(`🎉 성공!`);
                }
                else {
                    console.log(`❌ 실패: ${response.data.error}`);
                }
            }
            catch (error) {
                console.log(`❌ 오류: ${error.response?.data?.error || error.message}`);
            }
        }
        // 4. 오류 케이스 테스트
        console.log('\n\n4️⃣ 오류 케이스 테스트');
        console.log('='.repeat(50));
        const errorCases = [
            { name: '잘못된 URL', url: 'https://www.bdsplanet.com/invalid/path' },
            { name: '누락된 파라미터', url: '' },
        ];
        for (const errorCase of errorCases) {
            console.log(`\n📋 테스트: ${errorCase.name}`);
            try {
                const response = await axios_1.default.get(`${BASE_URL}/api/bds/urlpair`, {
                    params: { currentUrl: errorCase.url },
                });
                console.log(`❌ 예상과 다름: ${JSON.stringify(response.data)}`);
            }
            catch (error) {
                if (error.response?.status === 400 || error.response?.status === 422) {
                    console.log(`✅ 올바른 오류 응답: ${error.response.data.error}`);
                }
                else {
                    console.log(`❌ 예상치 못한 오류: ${error.message}`);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ 전체 테스트 실패:', error.message);
    }
    console.log('\n\n🏁 API 테스트 완료!');
}
// 서버가 시작될 때까지 잠시 대기
setTimeout(testAPI, 2000);
