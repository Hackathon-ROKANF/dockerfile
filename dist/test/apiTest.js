"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'http://localhost:3000';
// 테스트 케이스 정의
const testAddresses = [
    '생연로10',
    '역삼동',
    '강남역',
    '송파구',
    '마포구 홍대입구역'
];
async function testAPI() {
    console.log('🌐 BDS Planet API 테스트 시작\n');
    try {
        // 1. API 정보 확인
        console.log('1️⃣ API 정보 확인');
        console.log('='.repeat(50));
        const infoResponse = await axios_1.default.get(`${BASE_URL}/api/bds`);
        console.log('✅ API 정보:', JSON.stringify(infoResponse.data, null, 2));
        // 2. 주소별 가격 조회 테스트
        console.log('\n\n2️⃣ 주소별 가격 조회 테스트');
        console.log('='.repeat(50));
        for (const address of testAddresses) {
            console.log(`\n📋 테스트 주소: ${address}`);
            try {
                const response = await axios_1.default.get(`${BASE_URL}/api/bds/lowest`, {
                    params: { address },
                    timeout: 30000, // 30초 타임아웃
                });
                console.log('✅ 응답 데이터:');
                console.log(`   주소: ${response.data.주소}`);
                console.log(`   매매가: ${response.data.매매가.toLocaleString()}원`);
                console.log(`   전세가: ${response.data.전세가.toLocaleString()}원`);
                console.log(`   소스 URL: ${response.data.sourceUrl}`);
                console.log(`🎉 성공!`);
            }
            catch (error) {
                console.log(`❌ 오류: ${error.response?.data?.error || error.message}`);
            }
        }
        // 3. 오류 케이스 테스트
        console.log('\n\n3️⃣ 오류 케이스 테스트');
        console.log('='.repeat(50));
        const errorCases = [
            { name: '빈 주소', address: '' },
            { name: '존재하지 않는 주소', address: '없는주소12345' },
        ];
        for (const errorCase of errorCases) {
            console.log(`\n📋 테스트: ${errorCase.name}`);
            try {
                const response = await axios_1.default.get(`${BASE_URL}/api/bds/lowest`, {
                    params: { address: errorCase.address },
                    timeout: 10000,
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
