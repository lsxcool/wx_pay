/**
 * 微信退款结果回调
 * POST /refund-notify
 */
const express = require('express')
const axios = require('axios')

const router = express.Router()

router.post('/refund-notify', express.json(), async (req, res) => {
  const callbackData = req.body || {}
  console.log('收到退款回调:', JSON.stringify(callbackData))

  const callbackUrl = process.env.PROCESS_REFUND_CALLBACK_URL
  const callbackSecret = process.env.INTERNAL_CALLBACK_SECRET
  if (!callbackUrl) {
    console.error('未配置 PROCESS_REFUND_CALLBACK_URL')
    return res.status(500).json({ errcode: -1, errmsg: 'refund callback target missing' })
  }
  if (!callbackSecret) {
    console.error('未配置 INTERNAL_CALLBACK_SECRET')
    return res.status(500).json({ errcode: -1, errmsg: 'refund callback secret missing' })
  }

  try {
    const callbackResponse = await axios.post(callbackUrl, callbackData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Yemeng-Callback-Secret': callbackSecret
      },
      timeout: 4500
    })
    const result = callbackResponse.data || {}
    const callbackSucceeded = result.errcode === 0 || result.errCode === 0 ||
      (result.result && (result.result.errcode === 0 || result.result.errCode === 0))
    if (!callbackSucceeded) {
      console.error('processRefundCallback 返回异常:', result)
      return res.status(500).json({ errcode: -1, errmsg: result.errmsg || result.errMsg || 'refund callback failed' })
    }
    return res.json({ errcode: 0, errmsg: 'success' })
  } catch (error) {
    console.error('调用 processRefundCallback 失败:', error.message || error)
    return res.status(500).json({ errcode: -1, errmsg: 'refund callback failed' })
  }
})

module.exports = router
