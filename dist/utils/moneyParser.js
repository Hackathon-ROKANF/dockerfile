"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyParser = void 0;
/**
 * 한국어 가격 표기를 원 단위로 변환하는 유틸리티
 */
class MoneyParser {
    /**
     * 한국어 가격 문자열을 원 단위 숫자로 변환
     * 예: "2억 5천만원" -> 250000000
     */
    static toWon(priceText) {
        if (!priceText || typeof priceText !== 'string') {
            return null;
        }
        try {
            // 공백과 특수문자 제거, 소문자로 변환
            const cleaned = priceText.replace(/[,\s원]/g, '').toLowerCase();
            // 숫자가 없으면 null 반환
            if (!/\d/.test(cleaned)) {
                return null;
            }
            let total = 0;
            // 조 단위 처리
            const choMatch = cleaned.match(/(\d+(?:\.\d+)?)조/);
            if (choMatch) {
                total += parseFloat(choMatch[1]) * 1000000000000;
            }
            // 억 단위 처리
            const eokMatch = cleaned.match(/(\d+(?:\.\d+)?)억/);
            if (eokMatch) {
                total += parseFloat(eokMatch[1]) * 100000000;
            }
            // 만 단위 처리
            const manMatch = cleaned.match(/(\d+(?:\.\d+)?)만/);
            if (manMatch) {
                total += parseFloat(manMatch[1]) * 10000;
            }
            // 천 단위 처리
            const cheonMatch = cleaned.match(/(\d+(?:\.\d+)?)천/);
            if (cheonMatch) {
                total += parseFloat(cheonMatch[1]) * 1000;
            }
            // 단순 숫자만 있는 경우 (만원 단위로 가정)
            if (total === 0) {
                const numberMatch = cleaned.match(/(\d+(?:\.\d+)?)/);
                if (numberMatch) {
                    const number = parseFloat(numberMatch[1]);
                    // 1000 이상이면 원 단위, 미만이면 만원 단위로 가정
                    total = number >= 1000 ? number : number * 10000;
                }
            }
            return total > 0 ? Math.round(total) : null;
        }
        catch (error) {
            console.error('가격 파싱 오류:', error);
            return null;
        }
    }
    /**
     * 원 단위를 한국어 표기로 변환
     * 예: 250000000 -> "2억 5천만원"
     */
    static toKorean(won) {
        if (!won || won <= 0)
            return '0원';
        const eok = Math.floor(won / 100000000);
        const man = Math.floor((won % 100000000) / 10000);
        const won_remainder = won % 10000;
        let result = '';
        if (eok > 0) {
            result += `${eok}억`;
            if (man > 0)
                result += ` ${man}만`;
        }
        else if (man > 0) {
            result += `${man}만`;
        }
        if (won_remainder > 0 && eok === 0 && man === 0) {
            result += `${won_remainder}`;
        }
        result += '원';
        return result;
    }
}
exports.MoneyParser = MoneyParser;
