/**
 * 微信云托管支付服务 - 入口
 * 支付下单云函数配置：SUB_MCH_ID、ENV_ID、CALLBACK_SERVICE、CALLBACK_PATH。
 * 本云托管服务还需配置 PROCESS_PAYMENT_CALLBACK_URL、PROCESS_REFUND_CALLBACK_URL。
 */
const express = require('express');
const payNotifyRouter = require('./routes/payNotify');
const refundNotifyRouter = require('./routes/refundNotify');

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });

// 支付结果回调（与 CALLBACK_PATH 一致，如 /pay-notify）
app.use('/', payNotifyRouter);
// 退款结果回调：POST /refund-notify
app.use('/', refundNotifyRouter);

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`支付服务已启动，监听端口 ${port}`);
});
