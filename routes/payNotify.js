/**
 * 微信支付结果回调
 * POST /pay-notify（与 CALLBACK_PATH 保持一致）
 */
const express = require('express')
const axios = require('axios')

const router = express.Router()

function isPaymentSuccess(data) {
  return data.event_type === 'TRANSACTION.SUCCESS' ||
    data.trade_state === 'SUCCESS' ||
    data.tradeState === 'SUCCESS' ||
    (data.return_code === 'SUCCESS' && data.result_code === 'SUCCESS') ||
    (data.returnCode === 'SUCCESS' && data.resultCode === 'SUCCESS')
}

router.post('/pay-notify', express.json(), async (req, res) => {
  const callbackData = req.body || {}
  console.log('收到支付回调:', JSON.stringify(callbackData))

  if (!isPaymentSuccess(callbackData)) {
    return res.json({ errcode: 0, errmsg: 'success' })
  }

  const callbackUrl = process.env.PROCESS_PAYMENT_CALLBACK_URL
  const callbackSecret = process.env.INTERNAL_CALLBACK_SECRET
  if (!callbackUrl) {
    console.error('未配置 PROCESS_PAYMENT_CALLBACK_URL')
    return res.status(500).json({ errcode: -1, errmsg: 'payment callback target missing' })
  }
  if (!callbackSecret) {
    console.error('未配置 INTERNAL_CALLBACK_SECRET')
    return res.status(500).json({ errcode: -1, errmsg: 'payment callback secret missing' })
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
      console.error('processPaymentCallback 返回异常:', result)
      return res.status(500).json({ errcode: -1, errmsg: result.errmsg || result.errMsg || 'payment callback failed' })
    }
    return res.json({ errcode: 0, errmsg: 'success' })
  } catch (error) {
    console.error('调用 processPaymentCallback 失败:', error.message || error)
    return res.status(500).json({ errcode: -1, errmsg: 'payment callback failed' })
  }
})

module.exports = router
