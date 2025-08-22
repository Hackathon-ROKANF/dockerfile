import express from 'express'
import { BdsPlaywrightCrawler } from '../services/bdsCrawler'

const router = express.Router()
const crawler = new BdsPlaywrightCrawler()

/**
 * 주소별 최저가 매매/전세 정보 조회 API
 * GET /api/bds/lowest?address=생연로10
 */
router.get('/lowest', async (req, res) => {
  const { address } = req.query as { address: string }

  if (!address) {
    return res.status(400).json({
      error: '주소 파라미터가 필요합니다',
      example: '/api/bds/lowest?address=생연로10',
    })
  }

  try {
    console.log(`API 요청 받음: ${address}`)
    const result = await crawler.fetchLowestByAddress(address)

    if (!result) {
      return res.status(404).json({
        error: '가격 정보를 찾을 수 없습니다',
        address: address,
      })
    }

    return res.json(result)
  } catch (error: any) {
    console.error(`API 오류: ${error.message}`)
    return res.status(500).json({
      error: error.message,
      address: address,
    })
  }
})

/**
 * API 사용법 안내
 */
router.get('/', (req, res) => {
  res.json({
    message: 'BDS Planet 부동산 가격 조회 API',
    endpoints: [
      {
        path: '/api/bds/lowest',
        method: 'GET',
        description: '주소별 최저가 매매/전세 정보 조회',
        parameters: {
          address: 'required - 조회할 주소',
        },
        example: '/api/bds/lowest?address=생연로10',
        response: {
          주소: 'string',
          매매가: 'number (원 단위)',
          전세가: 'number (원 단위)',
          sourceUrl: 'string',
        },
      },
    ],
    availableAddresses: ['생연로10', '신갈로68번길26', '신갈동52-21'],
  })
})

export default router
