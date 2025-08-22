"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUrlPair = generateUrlPair;
exports.tryDecodeKorean = tryDecodeKorean;
exports.generateOppositeTabUrl = generateOppositeTabUrl;
const node_url_1 = require("node:url");
const iconv = __importStar(require("iconv-lite"));
// 패턴: /map/realprice_map/{encoded}/N/{A|B|Z}/{1|2}/{name}.ytp
const URL_PAIR_RE = /(?<prefix>\/map\/realprice_map\/[^/]+\/N\/[ABZ]\/)(?<tab>[12])\/(?<suffix>[^/]+\.ytp)/;
/**
 * 스프링 BdsPlaywrightCrawler.generateUrlPair() 메서드의 Node.js 이식 버전
 * 현재 URL에서 매매/전월세 탭 URL을 생성합니다.
 *
 * @param currentUrl 현재 URL (절대/상대 경로 모두 지원)
 * @param baseUrl 베이스 URL (기본: https://www.bdsplanet.com)
 * @returns 매매/전월세 URL 쌍과 주소 정보, 패턴 불일치 시 null
 */
function generateUrlPair(currentUrl, baseUrl = 'https://www.bdsplanet.com') {
    try {
        // currentUrl이 절대/상대든 관계없이 URL 객체로 정규화
        const u = new node_url_1.URL(currentUrl, baseUrl);
        const path = u.pathname;
        const m = path.match(URL_PAIR_RE);
        if (!m || !m.groups)
            return null;
        const { prefix, suffix } = m.groups;
        const salePath = `${prefix}1/${suffix}`;
        const rentPath = `${prefix}2/${suffix}`;
        const saleUrl = new node_url_1.URL(salePath, `${u.origin}`).toString();
        const rentUrl = new node_url_1.URL(rentPath, `${u.origin}`).toString();
        // 인코딩된 주소 세그먼트 추출: /map/realprice_map/{encoded}/N/...
        const encodedAddress = extractEncodedAddress(path);
        const decodedAddress = tryDecodeKorean(encodedAddress);
        return { saleUrl, rentUrl, encodedAddress, decodedAddress };
    }
    catch (error) {
        console.error('URL 생성 중 오류:', error);
        return null;
    }
}
/**
 * URL 경로에서 인코딩된 주소 세그먼트를 추출합니다.
 *
 * @param pathname URL 경로
 * @returns 인코딩된 주소 문자열
 */
function extractEncodedAddress(pathname) {
    // /map/realprice_map/{encoded}/N/...
    const i = pathname.indexOf('/map/realprice_map/');
    if (i < 0)
        return '';
    const rest = pathname.slice(i + '/map/realprice_map/'.length);
    const seg = rest.split('/')[0] || '';
    return seg;
}
/**
 * BDS Planet 특화 주소 디코딩
 * Base64 또는 커스텀 인코딩 방식으로 보임
 *
 * @param encoded 인코딩된 주소
 * @returns 디코딩된 주소 또는 undefined
 */
function tryDecodeKorean(encoded) {
    if (!encoded)
        return undefined;
    // 1. Base64 디코딩 시도
    try {
        const base64Decoded = Buffer.from(encoded, 'base64').toString('utf8');
        if (base64Decoded && isValidKoreanAddress(base64Decoded)) {
            return base64Decoded;
        }
    }
    catch (_) {
        // Base64 디코딩 실패
    }
    // 2. URL Safe Base64 디코딩 시도 (- _ 문자 포함)
    try {
        const urlSafeEncoded = encoded.replace(/-/g, '+').replace(/_/g, '/');
        // 패딩 추가
        const padding = '='.repeat((4 - (urlSafeEncoded.length % 4)) % 4);
        const base64WithPadding = urlSafeEncoded + padding;
        const urlSafeDecoded = Buffer.from(base64WithPadding, 'base64').toString('utf8');
        if (urlSafeDecoded && isValidKoreanAddress(urlSafeDecoded)) {
            return urlSafeDecoded;
        }
    }
    catch (_) {
        // URL Safe Base64 디코딩 실패
    }
    // 3. 퍼센트 인코딩 디코딩 시도 (기존 로직)
    try {
        const utf8 = decodeURIComponent(encoded);
        if (!looksMojibake(utf8))
            return utf8;
    }
    catch (_) {
        // 퍼센트 인코딩 실패
    }
    // 4. EUC-KR 디코딩 시도
    try {
        const bytes = [];
        for (let i = 0; i < encoded.length;) {
            if (encoded[i] === '%' && i + 2 < encoded.length) {
                const hex = encoded.slice(i + 1, i + 3);
                bytes.push(parseInt(hex, 16));
                i += 3;
            }
            else {
                bytes.push(encoded.charCodeAt(i));
                i += 1;
            }
        }
        const buf = Buffer.from(bytes);
        const euc = iconv.decode(buf, 'euc-kr');
        if (euc && !looksMojibake(euc))
            return euc;
    }
    catch (_) {
        // EUC-KR 디코딩 실패
    }
    return undefined;
}
/**
 * 유효한 한국 주소인지 검사
 */
function isValidKoreanAddress(str) {
    if (!str || str.length === 0)
        return false;
    // 한글 문자가 포함되어 있고, 깨진 문자가 없는지 확인
    const hasKorean = /[\uAC00-\uD7A3]/.test(str);
    const hasValidChars = /^[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F\s\d\-\.번길로동구시군면읍리가나다라마바사아자차카타파하]+$/.test(str);
    return hasKorean && hasValidChars && !looksMojibake(str);
}
/**
 * 문자열이 깨진 문자(mojibake)인지 검사합니다.
 *
 * @param s 검사할 문자열
 * @returns 깨진 문자로 보이면 true
 */
function looksMojibake(s) {
    // 너무 단순하지만 흔한 깨짐(U+FFFD) 있거나, 거의 전부 비한글/비ASCII면 깨짐으로 간주
    if (s.includes('\uFFFD'))
        return true;
    // 한글/한자/ASCII 비율 대충 체크
    const han = s.match(/[\uAC00-\uD7A3]/g)?.length ?? 0;
    const ascii = s.match(/[\x20-\x7E]/g)?.length ?? 0;
    return han + ascii < s.length * 0.5;
}
/**
 * 현재 탭을 감지해서 반대 탭 URL만 생성하는 헬퍼 함수
 *
 * @param currentUrl 현재 URL
 * @param baseUrl 베이스 URL
 * @returns 반대 탭 URL 또는 null
 */
function generateOppositeTabUrl(currentUrl, baseUrl = 'https://www.bdsplanet.com') {
    const result = generateUrlPair(currentUrl, baseUrl);
    if (!result)
        return null;
    try {
        const u = new node_url_1.URL(currentUrl, baseUrl);
        const path = u.pathname;
        const m = path.match(URL_PAIR_RE);
        if (!m || !m.groups)
            return null;
        const currentTab = m.groups.tab;
        return currentTab === '1' ? result.rentUrl : result.saleUrl;
    }
    catch (error) {
        console.error('반대 탭 URL 생성 중 오류:', error);
        return null;
    }
}
