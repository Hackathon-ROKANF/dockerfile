"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlPair_1 = require("../utils/urlPair");
// 실제 BDS Planet URL 테스트 데이터
const realTestUrls = [
    {
        name: '신갈로68번길 26 (전월세 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/QaQjYjYnwuE/N/A/2/84.37.ytp',
        expectedSale: 'https://www.bdsplanet.com/map/realprice_map/QaQjYjYnwuE/N/A/1/84.37.ytp',
        expectedRent: 'https://www.bdsplanet.com/map/realprice_map/QaQjYjYnwuE/N/A/2/84.37.ytp',
        expectedEncoded: 'QaQjYjYnwuE',
        expectedDecoded: '신갈로68번길 26', // 예상값
    },
    {
        name: '신갈동 52-21 (매매 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/toK4P4wISwE/N/B/1/66.78.ytp',
        expectedSale: 'https://www.bdsplanet.com/map/realprice_map/toK4P4wISwE/N/B/1/66.78.ytp',
        expectedRent: 'https://www.bdsplanet.com/map/realprice_map/toK4P4wISwE/N/B/2/66.78.ytp',
        expectedEncoded: 'toK4P4wISwE',
        expectedDecoded: '신갈동 52-21', // 예상값
    },
    {
        name: 'Z타입 (매매 탭)',
        url: 'https://www.bdsplanet.com/map/realprice_map/V0N4P4wISwE/N/Z/1/0.ytp',
        expectedSale: 'https://www.bdsplanet.com/map/realprice_map/V0N4P4wISwE/N/Z/1/0.ytp',
        expectedRent: 'https://www.bdsplanet.com/map/realprice_map/V0N4P4wISwE/N/Z/2/0.ytp',
        expectedEncoded: 'V0N4P4wISwE',
        expectedDecoded: undefined, // 주소가 명확하지 않음
    },
];
// 테스트할 인코딩된 주소들
const encodingTests = [
    { encoded: 'QaQjYjYnwuE', description: '신갈로68번길 26' },
    { encoded: 'toK4P4wISwE', description: '신갈동 52-21' },
    { encoded: 'V0N4P4wISwE', description: '알 수 없는 주소' },
];
console.log('🧪 BDS Planet URL Pair Generator 테스트 시작\n');
// 1. 실제 URL 패턴 테스트
console.log('1️⃣ 실제 BDS Planet URL 패턴 테스트');
console.log('='.repeat(60));
realTestUrls.forEach((test, index) => {
    console.log(`\n테스트 ${index + 1}: ${test.name}`);
    console.log(`입력 URL: ${test.url}`);
    const result = (0, urlPair_1.generateUrlPair)(test.url);
    if (result) {
        console.log(`✅ 매매 URL: ${result.saleUrl}`);
        console.log(`✅ 전월세 URL: ${result.rentUrl}`);
        console.log(`✅ 인코딩된 주소: ${result.encodedAddress}`);
        console.log(`✅ 디코딩된 주소: ${result.decodedAddress || 'undefined'}`);
        // 검증
        const saleMatch = result.saleUrl === test.expectedSale;
        const rentMatch = result.rentUrl === test.expectedRent;
        const encodedMatch = result.encodedAddress === test.expectedEncoded;
        if (saleMatch && rentMatch && encodedMatch) {
            console.log('🎉 URL 생성 검증 통과!');
        }
        else {
            console.log('❌ 검증 실패:');
            if (!saleMatch)
                console.log(`  - 매매 URL 불일치: 기대값 ${test.expectedSale}`);
            if (!rentMatch)
                console.log(`  - 전월세 URL 불일치: 기대값 ${test.expectedRent}`);
            if (!encodedMatch)
                console.log(`  - 인코딩 주소 불일치: 기대값 ${test.expectedEncoded}`);
        }
    }
    else {
        console.log('❌ URL 패턴 매칭 실패');
    }
});
// 2. 인코딩 방식 분석
console.log('\n\n2️⃣ BDS Planet 인코딩 방식 분석');
console.log('='.repeat(60));
encodingTests.forEach((test, index) => {
    console.log(`\n인코딩 분석 ${index + 1}: ${test.encoded} (${test.description})`);
    // 다양한 디코딩 방식 시도
    console.log('시도 중인 디코딩 방식:');
    // Base64 표준
    try {
        const base64Decoded = Buffer.from(test.encoded, 'base64').toString('utf8');
        console.log(`  - Base64 표준: "${base64Decoded}"`);
    }
    catch (e) {
        console.log(`  - Base64 표준: 실패`);
    }
    // URL Safe Base64
    try {
        const urlSafeEncoded = test.encoded.replace(/-/g, '+').replace(/_/g, '/');
        const padding = '='.repeat((4 - (urlSafeEncoded.length % 4)) % 4);
        const base64WithPadding = urlSafeEncoded + padding;
        const urlSafeDecoded = Buffer.from(base64WithPadding, 'base64').toString('utf8');
        console.log(`  - URL Safe Base64: "${urlSafeDecoded}"`);
    }
    catch (e) {
        console.log(`  - URL Safe Base64: 실패`);
    }
    // 16진수
    try {
        const hexDecoded = Buffer.from(test.encoded, 'hex').toString('utf8');
        console.log(`  - 16진수: "${hexDecoded}"`);
    }
    catch (e) {
        console.log(`  - 16진수: 실패`);
    }
    // 직접 문자 분석
    console.log(`  - 문자열 길이: ${test.encoded.length}`);
    console.log(`  - 문자 구성: ${test.encoded
        .split('')
        .map((c) => c.charCodeAt(0))
        .join(', ')}`);
    // 우리 함수로 디코딩 시도
    const ourResult = (0, urlPair_1.tryDecodeKorean)(test.encoded);
    console.log(`  - 우리 함수 결과: ${ourResult || 'undefined'}`);
});
// 3. 반대 탭 URL 생성 테스트
console.log('\n\n3️⃣ 반대 탭 URL 생성 테스트');
console.log('='.repeat(60));
realTestUrls.forEach((test, index) => {
    console.log(`\n테스트 ${index + 1}: ${test.name}`);
    console.log(`입력 URL: ${test.url}`);
    const oppositeUrl = (0, urlPair_1.generateOppositeTabUrl)(test.url);
    if (oppositeUrl) {
        console.log(`✅ 반대 탭 URL: ${oppositeUrl}`);
        // 현재 탭이 1이면 반대는 2, 현재 탭이 2면 반대는 1
        const isCurrentSale = test.url.includes('/1/');
        const expectedOpposite = isCurrentSale ? test.expectedRent : test.expectedSale;
        if (oppositeUrl === expectedOpposite) {
            console.log('🎉 반대 탭 URL 생성 성공!');
        }
        else {
            console.log(`❌ 반대 탭 URL 불일치: 기대값 ${expectedOpposite}`);
        }
    }
    else {
        console.log('❌ 반대 탭 URL 생성 실패');
    }
});
// 4. 잘못된 URL 패턴 테스트
console.log('\n\n4️⃣ 잘못된 URL 패턴 테스트');
console.log('='.repeat(60));
const invalidUrls = [
    'https://www.bdsplanet.com/map/invalid/path',
    'https://www.bdsplanet.com/map/realprice_map/',
    'https://www.bdsplanet.com/map/realprice_map/address/N/A/3/file.ytp', // 잘못된 탭 번호
    'https://www.bdsplanet.com/other/path/structure',
    'https://www.bdsplanet.com/map/realprice_map/QaQjYjYnwuE/N/X/1/84.37.ytp', // 잘못된 타입 (X)
];
invalidUrls.forEach((url, index) => {
    console.log(`\n테스트 ${index + 1}: ${url}`);
    const result = (0, urlPair_1.generateUrlPair)(url);
    if (result === null) {
        console.log('✅ 올바르게 null 반환');
    }
    else {
        console.log('❌ null을 반환해야 하지만 결과가 나옴:', result);
    }
});
console.log('\n\n🏁 테스트 완료!');
