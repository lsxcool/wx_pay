# 微信云托管 - Node.js 支付服务
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 80
CMD [ "node", "app.js" ]
