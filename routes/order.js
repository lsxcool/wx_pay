/**
 * 创建订单并调起支付
 * POST /api/create-order
 * 在云托管内调用微信支付统一下单（方式二），返回 payment 供小程序 wx.requestPayment 使用
 */
const express = require('express');
const router = express.Router();
const axios = require('axios');

const UNIFIED_ORDER_URL = 'http://api.weixin.qq.com/_/pay/unifiedOrder';

router.post('/create-order', async (req, res) => {
  try {
    const { activityId, openid, body: orderBody, totalFee, outTradeNo } = req.body;

    if (!openid) {
      return res.status(400).json({ errcode: 400, errmsg: '缺少 openid' });
    }

    const subMchId = process.env.SUB_MCH_ID;
    const envId = process.env.ENV_ID;
    const serviceName = process.env.SERVICE_NAME;
    const callbackPath = process.env.CALLBACK_PATH || '/pay-notify';

    if (!subMchId || !envId || !serviceName) {
      return res.status(500).json({
        errcode: 500,
        errmsg: '服务未配置支付环境变量（SUB_MCH_ID、ENV_ID、SERVICE_NAME）'
      });
    }

    const orderNo = outTradeNo || 'PAY' + Date.now() + Math.random().toString(36).substr(2, 6);
    const totalFeeFen = totalFee != null ? Math.round(Number(totalFee)) : 100;
    const body = orderBody || '活动报名费';

    const payPayload = {
      openid,
      body,
      out_trade_no: orderNo,
      spbill_create_ip: '127.0.0.1',
      sub_mch_id: subMchId,
      total_fee: totalFeeFen,
      env_id: envId,
      callback_type: 2,
      container: {
        service: serviceName,
        path: callbackPath
      }
    };

    const payResponse = await axios.post(UNIFIED_ORDER_URL, payPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    const data = payResponse.data;
    if (data.errcode && data.errcode !== 0) {
      return res.status(500).json({
        errcode: data.errcode,
        errmsg: data.errmsg || '统一下单失败'
      });
    }

    const payment = data.payment || (data.respdata && data.respdata.payment);
    if (!payment) {
      return res.status(500).json({
        errcode: 500,
        errmsg: '统一下单返回无 payment 参数'
      });
    }

    res.json({
      errcode: 0,
      errmsg: 'ok',
      data: {
        orderId: orderNo,
        outTradeNo: orderNo,
        payment
      }
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    const msg = error.response && error.response.data
      ? (error.response.data.errmsg || JSON.stringify(error.response.data))
      : (error.message || '创建订单失败');
    res.status(500).json({
      errcode: 500,
      errmsg: msg
    });
  }
});

module.exports = router;
