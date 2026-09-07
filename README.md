# 微信云托管支付服务 (wx_pay)

Node.js + Express 项目，用于在微信云托管中提供统一下单与支付回调，可直接部署到云托管。

## 本地结构

```
wx_pay/
├── app.js              # 入口，注册路由
├── package.json
├── Dockerfile          # 云托管构建用
├── .gitignore
├── README.md
└── routes/
    ├── order.js        # 历史下单路由，当前不注册（避免前端传金额）
    ├── payNotify.js    # POST /pay-notify 支付结果回调
    └── refundNotify.js # POST /refund-notify 退款结果回调
```

## 环境变量（云托管控制台配置）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| SUB_MCH_ID | 微信支付商户号 | 1900000109 |
| ENV_ID | 云托管环境 ID | prod-2g8kxxxxxx |
| CALLBACK_SERVICE | 当前云托管支付服务名称（`createRegistrationAndOrder` 使用；也兼容旧的 `SERVICE_NAME`） | pay-service |
| CALLBACK_PATH | 支付回调路径，与代码中一致 | /pay-notify |
| PROCESS_PAYMENT_CALLBACK_URL | processPaymentCallback 云函数 HTTP 触发器地址（支付成功后更新订单/报名状态） | 云开发控制台为该云函数开通 HTTP 触发器后得到的 URL |
| PROCESS_REFUND_CALLBACK_URL | processRefundCallback 云函数 HTTP 触发器地址（退款最终结果更新票数和参与者头像） | 云开发控制台为该云函数开通 HTTP 触发器后得到的 URL |

## 接口说明

- 下单统一由 `createRegistrationAndOrder` 云函数完成，票价与总金额仅由服务端从活动数据计算；云托管不再暴露可由前端传入金额的下单接口。

- **POST /pay-notify**  
  微信支付异步通知，必须返回 `{ errcode: 0, errmsg: "success" }`。

- **POST /refund-notify**  
  微信退款异步通知；转发到 `processRefundCallback` 成功后才返回成功，避免业务处理失败时丢失微信重试。

## 部署

1. 在云托管控制台创建服务（如 pay-service），选择 Node.js/自定义镜像或上传代码。
2. 配置上述环境变量。
3. 通过 Git 或代码包上传本目录，构建并发布版本。

本地调试：`npm install && npm start`，默认端口 80（可用 `PORT=3000 npm start`）。
