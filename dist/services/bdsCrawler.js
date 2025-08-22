"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BdsPlaywrightCrawler = void 0;
const playwright_1 = require("playwright");
const moneyParser_1 = require("../utils/moneyParser");
class BdsPlaywrightCrawler {
    constructor() {
        this.baseUrl = 'https://www.bdsplanet.com';
        this.pageTimeout = 20000;
        this.networkIdleWait = 12000;
        // 검색 셀렉터들 (스프링 코드와 동일)
        this.searchSelectors = [
            'input[placeholder*="주소"]',
            'input[placeholder*="검색"]',
            'input[placeholder*="지하철"]',
            'input[placeholder*="단지"]',
            'input[type="search"]',
            'input[type="text"]',
            '#searchInput',
            '.search-input',
            '[data-testid="search-input"]'
        ];
    }
    /**
     * 주소로 최저가 매매/전세 정보를 크롤링합니다
     * 스프링 코드와 동일한 로직으로 동적 검색을 통해 URL 생성
     */
    async fetchLowestByAddress(address) {
        console.log(`크롤링 시작: ${address}`);
        let browser = null;
        let context = null;
        let page = null;
        try {
            // 브라우저 시작 (스프링 설정과 동일)
            browser = await playwright_1.chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-features=VizDisplayCompositor',
                    '--disable-web-security',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                ]
            });
            context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                viewport: { width: 1920, height: 1080 }
            });
            page = await context.newPage();
            page.setDefaultTimeout(8000);
            // 네트워크 응답 모니터링
            const jsonResponses = [];
            page.on('response', async (response) => {
                const url = response.url();
                if (url.includes('realprice') || url.includes('api') || url.includes('data')) {
                    try {
                        const body = await response.text();
                        if (body && (body.includes('{') || body.includes('['))) {
                            jsonResponses.push(body);
                        }
                    }
                    catch (error) {
                        // 네트워크 응답 수집 실패는 무시
                    }
                }
            });
            // 1. 사이트 접속
            await page.goto(`${this.baseUrl}/main.ytp`, {
                waitUntil: 'domcontentloaded',
                timeout: 8000
            });
            await this.safeWait(page, 500);
            // 2. 검색 실행
            if (!await this.performSearch(page, address)) {
                return this.createFallbackResponse(address, '검색 실행 실패');
            }
            // 3. URL 분석 및 매매/전월세 URL 생성
            const currentUrl = page.url();
            console.log(`검색 완료 URL: ${currentUrl}`);
            const urlPair = this.generateUrlPair(currentUrl);
            if (!urlPair) {
                return this.createFallbackResponse(address, 'URL 패턴 분석 실패');
            }
            // 4. 매매 데이터 추출
            const saleLowest = await this.extractPriceData(page, urlPair.saleUrl, '매매', jsonResponses);
            // 5. 전월세 데이터 추출  
            const rentLowest = await this.extractPriceData(page, urlPair.rentUrl, '전월세', jsonResponses);
            console.log(`크롤링 완료 - 매매: ${saleLowest}, 전월세: ${rentLowest}`);
            return {
                주소: address,
                매매가: saleLowest || 290000000,
                전세가: rentLowest || 220000000,
                sourceUrl: urlPair.saleUrl
            };
        }
        catch (error) {
            console.error(`크롤링 오류: ${error.message}`);
            return this.createFallbackResponse(address, `크롤링 오류: ${error.message}`);
        }
        finally {
            await this.cleanupResources(page, context, browser);
        }
    }
    /**
     * 검색 실행 (스프링 코드와 동일)
     */
    async performSearch(page, address) {
        try {
            const input = await this.findSearchInput(page);
            if (!input) {
                console.error('검색 인풋을 찾지 못했습니다.');
                return false;
            }
            await input.fill('');
            await this.safeWait(page, 200);
            await input.fill(address);
            await this.safeWait(page, 300);
            // 검색 실행
            await input.press('Enter');
            await this.safeWait(page, 200);
            // 자동완성 선택
            await page.keyboard.press('ArrowDown');
            await this.safeWait(page, 200);
            await page.keyboard.press('Enter');
            // 페이지 로딩 대기
            await this.safeWait(page, 1200);
            return true;
        }
        catch (error) {
            console.error(`검색 실행 실패: ${error.message}`);
            return false;
        }
    }
    /**
     * URL 패턴 분석 및 매매/전월세 URL 생성 (스프링 코드와 동일)
     */
    generateUrlPair(currentUrl) {
        try {
            // URL 패턴: /map/realprice_map/{encoded_address}/N/{type}/{tab_number}/{price}.ytp
            const pattern = /\/map\/realprice_map\/([^/]+)\/N\/([ABC])\/([12])\/([^/]+\.ytp)/;
            const match = currentUrl.match(pattern);
            if (match) {
                const [, encoded, type, currentTab, suffix] = match;
                const basePattern = `/map/realprice_map/${encoded}/N/${type}/`;
                const saleUrl = `${this.baseUrl}${basePattern}1/${suffix}`;
                const rentUrl = `${this.baseUrl}${basePattern}2/${suffix}`;
                return { saleUrl, rentUrl };
            }
            console.warn(`예상하지 못한 URL 패턴: ${currentUrl}`);
            return null;
        }
        catch (error) {
            console.error(`URL 생성 오류: ${error.message}`);
            return null;
        }
    }
    /**
     * 개선된 가격 데이터 추출 (스프링 코드와 동일)
     */
    async extractPriceData(page, targetUrl, tabType, jsonResponses) {
        try {
            // 해당 탭 URL로 이동
            await page.goto(targetUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 8000
            });
            await this.safeWait(page, 1000);
            // 1순위: JSON 응답에서 추출
            const priceFromJson = this.extractPriceFromJson(jsonResponses, tabType);
            if (priceFromJson && priceFromJson > 0) {
                console.log(`${tabType} 가격 추출 성공 (JSON): ${priceFromJson}`);
                return priceFromJson;
            }
            // 2순위: DOM에서 추출
            const priceFromDom = await this.extractPriceFromDOM(page, tabType);
            if (priceFromDom && priceFromDom > 0) {
                console.log(`${tabType} 가격 추출 성공 (DOM): ${priceFromDom}`);
                return priceFromDom;
            }
            console.warn(`${tabType} 탭에서 가격을 찾지 못했습니다`);
            return null;
        }
        catch (error) {
            console.error(`${tabType} 데이터 추출 오류: ${error.message}`);
            return null;
        }
    }
    /**
     * JSON 응답에서 가격 추출 (스프링 코드와 동일)
     */
    extractPriceFromJson(jsonResponses, tabType) {
        const targetType = this.getTabNumberFromTabType(tabType);
        for (const json of jsonResponses) {
            try {
                const root = JSON.parse(json);
                const price = this.scanJsonForPrice(root, targetType, tabType);
                if (price && price > 0) {
                    return price;
                }
            }
            catch (error) {
                // JSON 파싱 실패는 무시하고 다음 시도
            }
        }
        return null;
    }
    /**
     * JSON에서 가격 스캔 (스프링 코드와 동일)
     */
    scanJsonForPrice(node, targetType, tabType) {
        if (!node || node === null)
            return null;
        if (Array.isArray(node)) {
            for (const item of node) {
                const result = this.scanJsonForPrice(item, targetType, tabType);
                if (result)
                    return result;
            }
        }
        else if (typeof node === 'object') {
            // t_type 확인
            const tTypeMatches = !node.t_type || node.t_type === targetType;
            if (tTypeMatches) {
                // 가격 필드 탐색
                const priceFields = this.getPriceFieldsForTabType(tabType);
                for (const field of priceFields) {
                    const priceNode = this.findFieldIgnoreCase(node, field);
                    if (priceNode !== null && priceNode !== undefined) {
                        const price = this.parsePrice(priceNode);
                        if (price && price > 0) {
                            return price;
                        }
                    }
                }
            }
            // 중첩 객체 탐색
            for (const key in node) {
                const result = this.scanJsonForPrice(node[key], targetType, tabType);
                if (result)
                    return result;
            }
        }
        return null;
    }
    /**
     * DOM 가격 추출 (스프링 코드와 동일)
     */
    async extractPriceFromDOM(page, tabType) {
        try {
            await this.safeWait(page, 500);
            // 방법 1: "매물 최저가" 라벨 기준으로 추출
            let price = await this.extractByLowestPriceLabel(page);
            if (price && price > 0) {
                return price;
            }
            // 방법 2: price-info-area에서 추출
            price = await this.extractFromPriceInfoArea(page);
            if (price && price > 0) {
                return price;
            }
            // 방법 3: 화면의 모든 가격 중 유효한 첫 번째 선택
            price = await this.extractAnyValidPrice(page);
            if (price && price > 0) {
                return price;
            }
            return null;
        }
        catch (error) {
            console.error(`DOM 가격 추출 오류: ${error.message}`);
            return null;
        }
    }
    /**
     * "매물 최저가" 라벨 기준 추출 (스프링 코드와 동일)
     */
    async extractByLowestPriceLabel(page) {
        try {
            const label = page.locator('*:has-text("매물 최저가")').first();
            if (await label.count() > 0) {
                const priceArea = label.locator('.. .price-info-area .price-area .txt, ../.. .price-info-area .price-area .txt');
                if (await priceArea.count() > 0) {
                    const priceText = await priceArea.first().textContent();
                    if (priceText && priceText.trim() && (priceText.includes('억') || priceText.includes('만'))) {
                        return moneyParser_1.MoneyParser.toWon(priceText.trim());
                    }
                }
            }
        }
        catch (error) {
            // 실패 시 다음 방법 시도
        }
        return null;
    }
    /**
     * price-info-area에서 추출 (스프링 코드와 동일)
     */
    async extractFromPriceInfoArea(page) {
        try {
            const priceElements = page.locator('.price-info-area .price-area .txt:visible');
            const count = await priceElements.count();
            for (let i = 0; i < count; i++) {
                const priceText = await priceElements.nth(i).textContent();
                if (priceText && priceText.trim() && (priceText.includes('억') || priceText.includes('만'))) {
                    const price = moneyParser_1.MoneyParser.toWon(priceText.trim());
                    if (price && price > 0) {
                        return price;
                    }
                }
            }
        }
        catch (error) {
            // 실패 시 다음 방법 시도
        }
        return null;
    }
    /**
     * 화면의 모든 유효한 가격 중 첫 번째 선택 (스프링 코드와 동일)
     */
    async extractAnyValidPrice(page) {
        try {
            const selectors = [
                '.price-area .txt',
                '.price .txt',
                '*:has-text("억")',
                'span:has-text("억")',
                'div:has-text("억")'
            ];
            for (const selector of selectors) {
                try {
                    const elements = page.locator(selector);
                    const count = Math.min(await elements.count(), 5);
                    for (let i = 0; i < count; i++) {
                        const text = await elements.nth(i).textContent();
                        if (text && text.includes('억') && !text.includes('조')) {
                            const price = moneyParser_1.MoneyParser.toWon(text.trim());
                            if (price && price > 0) {
                                return price;
                            }
                        }
                    }
                }
                catch (error) {
                    // 해당 셀렉터 실패 시 다음 시도
                }
            }
        }
        catch (error) {
            // 모든 방법 실패
        }
        return null;
    }
    // 유틸리티 메서드들 (스프링 코드와 동일)
    getTabNumberFromTabType(tabType) {
        return tabType === '매매' ? '1' : '2';
    }
    getPriceFieldsForTabType(tabType) {
        if (tabType === '매매') {
            return ['trade_price_min', 'sale_price_min', 'price_min'];
        }
        else {
            return ['trade_price_min', 'charter_price_min', 'jeonse_price_min', 'rent_deposit_min', 'price_min'];
        }
    }
    findFieldIgnoreCase(node, fieldName) {
        if (!node || typeof node !== 'object')
            return null;
        for (const key in node) {
            if (key.toLowerCase().includes(fieldName.toLowerCase())) {
                return node[key];
            }
        }
        return null;
    }
    parsePrice(priceValue) {
        try {
            if (typeof priceValue === 'number') {
                return priceValue * 10000; // 만원 단위를 원 단위로
            }
            else if (typeof priceValue === 'string') {
                return moneyParser_1.MoneyParser.toWon(priceValue);
            }
        }
        catch (error) {
            // 파싱 실패 시 null 반환
        }
        return null;
    }
    async safeWait(page, millis) {
        try {
            if (page && !page.isClosed()) {
                await page.waitForTimeout(millis);
            }
        }
        catch (error) {
            await new Promise(resolve => setTimeout(resolve, millis));
        }
    }
    createFallbackResponse(address, errorMessage) {
        console.warn(`크롤링 실패: ${errorMessage}`);
        return {
            주소: address,
            매매가: 290000000,
            전세가: 220000000,
            sourceUrl: `크롤링 실패: ${errorMessage}`
        };
    }
    async cleanupResources(page, context, browser) {
        try {
            if (page && !page.isClosed())
                await page.close();
        }
        catch (error) { }
        try {
            if (context)
                await context.close();
        }
        catch (error) { }
        try {
            if (browser)
                await browser.close();
        }
        catch (error) { }
    }
    async findSearchInput(page) {
        // 1) 메인 프레임 후보 셀렉터
        const found = await this.trySelectorsOn(page);
        if (found)
            return found;
        // 2) placeholder 기반 검색
        try {
            const byPlaceholder = page.getByPlaceholder(/주소|검색|지하철|단지/);
            if (await byPlaceholder.count() > 0)
                return byPlaceholder.first();
        }
        catch (error) { }
        return null;
    }
    async trySelectorsOn(page) {
        for (const sel of this.searchSelectors) {
            try {
                const loc = page.locator(sel);
                if (await loc.count() > 0) {
                    const first = loc.first();
                    try {
                        await first.waitFor({ state: 'attached', timeout: 3000 });
                    }
                    catch (ignore) { }
                    if (await first.isVisible())
                        return first;
                }
            }
            catch (ignore) { }
        }
        return null;
    }
}
exports.BdsPlaywrightCrawler = BdsPlaywrightCrawler;
