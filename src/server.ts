import express from 'express'
import cors from 'cors'
import bdsRouter from './routes/bds'

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어 설정
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 라우터 설정
app.use('/api/bds', bdsRouter)

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'BDS Planet 크롤링 API 서버',
    version: '1.0.0',
    features: ['Real Estate Price Crawling', 'Korean Address Support', 'Playwright Automation'],
    endpoints: {
      bds: '/api/bds',
    },
  })
})

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/api/bds', '/api/bds/lowest'],
  })
})

// 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  })
})

app.listen(PORT, () => {
  console.log(`🚀 BDS Planet 크롤링 서버가 포트 ${PORT}에서 실행 중입니다`)
  console.log(`📋 API Documentation: http://localhost:${PORT}/api/bds`)
  console.log(`🏠 가격 조회: http://localhost:${PORT}/api/bds/lowest?address=생연로10`)
})
