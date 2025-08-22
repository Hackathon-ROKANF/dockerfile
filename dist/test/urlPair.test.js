"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const urlPair_1 = require("../utils/urlPair");
// 테스트 데이터
const testUrls = [
    {
        name: '매매 탭 URL (고매동)',
        url: 'https://disco.re/map/realprice_map/%EA%B3%A0%EB%A7%A4%EB%8F%99/N/A/1/price.ytp',
        expectedSale: 'https://disco.re/map/realprice_map/%EA%B3%A0%EB%A7%A4%EB%8F%99/N/A/1/price.ytp',
        expectedRent: 'https://disco.re/map/realprice_map/%EA%B3%A0%EB%A7%A4%EB%8F%99/N/A/2/price.ytp',
        expectedEncoded: '%EA%B3%A0%EB%A7%A4%EB%8F%99',
        expectedDecoded: '고매동',
    },
    {
        name: '전월세 탭 URL (서초동)',
        url: 'https://disco.re/map/realprice_map/%EC%84%9C%EC%B4%88%EB%8F%99/N/B/2/market.ytp',
        expectedSale: 'https://disco.re/map/realprice_map/%EC%84%9C%EC%B4%88%EB%8F%99/N/B/1/market.ytp',
        expectedRent: 'https://disco.re/map/realprice_map/%EC%84%9C%EC%B4%88%EB%8F%99/N/B/2/market.ytp',
        expectedEncoded: '%EC%84%9C%EC%B4%88%EB%8F%99',
        expectedDecoded: '서초동',
    },
    {
        name: '매매 탭 URL (강남구)',
        url: 'https://disco.re/map/realprice_map/%EA%B0%95%EB%82%A8%EA%B5%AC/N/C/1/data.ytp',
        expectedSale: 'https://disco.re/map/realprice_map/%EA%B0%95%EB%82%A8%EA%B5%AC/N/C/1/data.ytp',
        expectedRent: 'https://disco.re/map/realprice_map/%EA%B0%95%EB%82%A8%EA%B5%AC/N/C/2/data.ytp',
        expectedEncoded: '%EA%B0%95%EB%82%A8%EA%B5%AC',
        expectedDecoded: '강남구',
    },
    {
        name: '상대 경로 URL',
        url: '/map/realprice_map/%EB%A7%88%ED%8F%AC%EA%B5%AC/N/A/1/info.ytp',
        expectedSale: 'https://disco.re/map/realprice_map/%EB%A7%88%ED%8F%AC%EA%B5%AC/N/A/1/info.ytp',
        expectedRent: 'https://disco.re/map/realprice_map/%EB%A7%88%ED%8F%AC%EA%B5%AC/N/A/2/info.ytp',
        expectedEncoded: '%EB%A7%88%ED%8F%AC%EA%B5%AC',
        expectedDecoded: '마포구',
    },
];
const invalidUrls = [
    'https://disco.re/map/invalid/path',
    'https://disco.re/map/realprice_map/',
    'https://disco.re/map/realprice_map/address/N/A/3/file.ytp', // 잘못된 탭 번호
    'https://disco.re/other/path/structure',
];
console.log('🧪 BDS URL Pair Generator 테스트 시작\n');
// 1. 기본 URL 패턴 테스트
console.log('1️⃣ 기본 URL 패턴 테스트');
console.log('='.repeat(50));
testUrls.forEach((test, index) => {
    console.log(`\n테스트 ${index + 1}: ${test.name}`);
    console.log(`입력 URL: ${test.url}`);
    const result = (0, urlPair_1.generateUrlPair)(test.url);
    if (result) {
        console.log(`✅ 매매 URL: ${result.saleUrl}`);
        console.log(`✅ 전월세 URL: ${result.rentUrl}`);
        console.log(`✅ 인코딩된 주소: ${result.encodedAddress}`);
        console.log(`✅ 디코딩된 주소: ${result.decodedAddress}`);
        // 검증
        const saleMatch = result.saleUrl === test.expectedSale;
        const rentMatch = result.rentUrl === test.expectedRent;
        const encodedMatch = result.encodedAddress === test.expectedEncoded;
        const decodedMatch = result.decodedAddress === test.expectedDecoded;
        if (saleMatch && rentMatch && encodedMatch && decodedMatch) {
            console.log('🎉 모든 검증 통과!');
        }
        else {
            console.log('❌ 검증 실패:');
            if (!saleMatch)
                console.log(`  - 매매 URL 불일치: 기대값 ${test.expectedSale}`);
            if (!rentMatch)
                console.log(`  - 전월세 URL 불일치: 기대값 ${test.expectedRent}`);
            if (!encodedMatch)
                console.log(`  - 인코딩 주소 불일치: 기대값 ${test.expectedEncoded}`);
            if (!decodedMatch)
                console.log(`  - 디코딩 주소 불일치: 기대값 ${test.expectedDecoded}`);
        }
    }
    else {
        console.log('❌ URL 패턴 매칭 실패');
    }
});
// 2. 잘못된 URL 테스트
console.log('\n\n2️⃣ 잘못된 URL 패턴 테스트');
console.log('='.repeat(50));
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
// 3. 반대 탭 URL 생성 테스트
console.log('\n\n3️⃣ 반대 탭 URL 생성 테스트');
console.log('='.repeat(50));
testUrls.forEach((test, index) => {
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
// 4. 인코딩/디코딩 테스트
console.log('\n\n4️⃣ 한글 인코딩/디코딩 테스트');
console.log('='.repeat(50));
const encodingTests = [
    { encoded: '%EA%B3%A0%EB%A7%A4%EB%8F%99', expected: '고매동' },
    { encoded: '%EC%84%9C%EC%B4%88%EB%8F%99', expected: '서초동' },
    { encoded: '%EA%B0%95%EB%82%A8%EA%B5%AC', expected: '강남구' },
    { encoded: '%EB%A7%88%ED%8F%AC%EA%B5%AC', expected: '마포구' },
    { encoded: 'invalid%XX%YY', expected: undefined }, // 잘못된 인코딩
    { encoded: '', expected: undefined }, // 빈 문자열
];
encodingTests.forEach((test, index) => {
    console.log(`\n인코딩 테스트 ${index + 1}: ${test.encoded}`);
    const decoded = (0, urlPair_1.tryDecodeKorean)(test.encoded);
    if (decoded === test.expected) {
        console.log(`✅ 디코딩 성공: ${decoded || 'undefined'}`);
    }
    else {
        console.log(`❌ 디코딩 실패: 기대값 ${test.expected}, 실제값 ${decoded}`);
    }
});
console.log('\n\n🏁 테스트 완료!');
