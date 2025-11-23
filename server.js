// 支持文件自动更新的本地开发服务器
const express = require('express');
const chokidar = require('chokidar');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 8000;

// 创建HTTP服务器
const server = http.createServer(app);

// 创建WebSocket服务器
const wss = new WebSocket.Server({ server });

// 静态文件服务
app.use(express.static(__dirname));

// 监听WebSocket连接
wss.on('connection', (ws) => {
  console.log('客户端已连接');
  
  // 发送连接成功消息
  ws.send(JSON.stringify({
    type: 'connected',
    message: '热重载服务已连接'
  }));
});

// 通知所有客户端刷新页面
function notifyClients() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'reload',
        timestamp: Date.now()
      }));
    }
  });
}

// 监视文件变化
const watcher = chokidar.watch(__dirname, {
  ignored: /node_modules|\.git/,
  persistent: true,
  ignoreInitial: true
});

// 文件变化事件处理
watcher.on('change', (filePath) => {
  const relativePath = path.relative(__dirname, filePath);
  console.log(`文件已变更: ${relativePath}`);
  
  // 只对HTML、CSS、JavaScript和JSON文件进行热重载
  if (/\.(html|css|js|json|jpg|jpeg|png|gif|svg)$/i.test(filePath)) {
    notifyClients();
  }
});

// 启动服务器
server.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('文件更改时将自动刷新页面');
});

// 退出时清理
process.on('SIGINT', () => {
  console.log('正在关闭服务器...');
  watcher.close();
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});