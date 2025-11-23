#!/usr/bin/env python3
# 基于Python的文件自动更新服务器
import http.server
import socketserver
import os
import threading
import time
import json
from urllib.parse import urlparse

# 配置
PORT = 8000
REFRESH_INTERVAL = 1  # 秒

# 存储文件最后修改时间
file_mod_times = {}

# 自定义请求处理器
class AutoReloadHandler(http.server.SimpleHTTPRequestHandler):
    # 跟踪客户端连接
    active_clients = set()
    
    @classmethod
    def add_client(cls, client_address):
        cls.active_clients.add(client_address)
        print(f"客户端已连接: {client_address}")
    
    @classmethod
    def remove_client(cls, client_address):
        if client_address in cls.active_clients:
            cls.active_clients.remove(client_address)
            print(f"客户端已断开: {client_address}")
    
    def do_GET(self):
        # 处理热重载检查请求
        if self.path == '/hot-reload-check':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # 检查文件是否有更新
            has_updates = check_files_for_updates()
            response = {
                'has_updates': has_updates,
                'timestamp': time.time()
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # 处理热重载脚本请求
        elif self.path == '/hot-reload.js':
            # 返回热重载客户端脚本
            self.send_response(200)
            self.send_header('Content-type', 'application/javascript')
            self.end_headers()
            
            hot_reload_js = """
// 热重载客户端脚本
class HotReloadClient {
  constructor() {
    this.checkInterval = 1000; // 检查间隔，单位毫秒
    this.lastUpdateTime = Date.now();
  }

  start() {
    console.log('启动文件自动更新检查...');
    this.showNotification('✓ 自动刷新已启用');
    this.checkForUpdates();
  }

  async checkForUpdates() {
    try {
      const response = await fetch('/hot-reload-check');
      const data = await response.json();
      
      if (data.has_updates) {
        console.log('检测到文件更新，正在刷新页面...');
        this.showNotification('🔄 文件已更新，正在刷新页面...');
        // 添加时间戳以避免缓存
        const timestamp = new Date().getTime();
        window.location.href = `${window.location.pathname}?reload=${timestamp}`;
        return;
      }
    } catch (error) {
      console.error('检查更新时出错:', error);
    }
    
    // 继续检查
    setTimeout(() => this.checkForUpdates(), this.checkInterval);
  }

  showNotification(message, type = 'success') {
    // 检查是否已存在通知元素
    const existingNotification = document.getElementById('hot-reload-notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // 创建通知元素
    const notification = document.createElement('div');
    notification.id = 'hot-reload-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 15px;
      background-color: ${type === 'success' ? '#4CAF50' : '#FF9800'};
      color: white;
      border-radius: 4px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 9999;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;

    // 添加到页面
    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// 页面加载完成后启动自动刷新
document.addEventListener('DOMContentLoaded', () => {
  const hotReloadClient = new HotReloadClient();
  hotReloadClient.start();
});
            """
            
            self.wfile.write(hot_reload_js.encode('utf-8'))
            return
        
        # 处理其他请求
        # 确保为HTML文件添加无缓存头
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path.endswith('.html') or path.endswith('.css') or path.endswith('.js') or path.endswith('.json'):
            self.send_response(200)
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
            
            # 设置正确的Content-Type
            if path.endswith('.html'):
                self.send_header('Content-type', 'text/html')
            elif path.endswith('.css'):
                self.send_header('Content-type', 'text/css')
            elif path.endswith('.js'):
                self.send_header('Content-type', 'application/javascript')
            elif path.endswith('.json'):
                self.send_header('Content-type', 'application/json')
            
            self.end_headers()
            
            # 读取并发送文件内容
            try:
                # 去掉路径开头的斜杠
                file_path = path[1:] if path.startswith('/') else path
                if not file_path:
                    file_path = 'index.html'
                    
                with open(file_path, 'rb') as file:
                    self.wfile.write(file.read())
            except FileNotFoundError:
                self.send_error(404, "File not found")
        else:
            # 对于其他文件使用默认处理
            super().do_GET()
    
    # 记录连接和断开
    def log_request(self, code='-', size='-'):
        # 不记录正常请求，只记录错误
        if isinstance(code, int) and code >= 400:
            super().log_request(code, size)
    
    def log_message(self, format, *args):
        # 自定义日志输出
        if not any(arg for arg in args if isinstance(arg, str) and 'hot-reload-check' in arg):
            super().log_message(format, *args)

# 检查文件是否有更新
def check_files_for_updates():
    has_updates = False
    
    # 遍历项目中的所有HTML、CSS、JS和JSON文件
    for root, dirs, files in os.walk('.'):
        # 跳过node_modules和.git目录
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            # 只检查指定类型的文件
            if file.endswith(('.html', '.css', '.js', '.json', '.jpg', '.jpeg', '.png', '.gif', '.svg')):
                file_path = os.path.join(root, file)
                try:
                    # 获取文件修改时间
                    mod_time = os.path.getmtime(file_path)
                    
                    # 如果是新文件或已修改的文件
                    if file_path not in file_mod_times or file_mod_times[file_path] != mod_time:
                        if file_path in file_mod_times:
                            print(f"检测到文件变更: {file_path}")
                        file_mod_times[file_path] = mod_time
                        has_updates = True
                except Exception as e:
                    print(f"检查文件时出错 {file_path}: {e}")
    
    return has_updates

# 初始化文件修改时间记录
def init_file_mod_times():
    print("正在扫描项目文件...")
    for root, dirs, files in os.walk('.'):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith(('.html', '.css', '.js', '.json', '.jpg', '.jpeg', '.png', '.gif', '.svg')):
                file_path = os.path.join(root, file)
                try:
                    file_mod_times[file_path] = os.path.getmtime(file_path)
                except Exception:
                    pass
    print(f"已扫描 {len(file_mod_times)} 个文件")

# 主函数
def run_server():
    # 初始化文件修改时间
    init_file_mod_times()
    
    # 创建服务器
    Handler = AutoReloadHandler
    
    with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
        print(f"自动更新服务器已启动在 http://localhost:{PORT}")
        print("当文件发生变化时，页面将自动刷新")
        print("按 Ctrl+C 停止服务器")
        try:
            # 启动服务器
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n正在关闭服务器...")
            httpd.server_close()
            print("服务器已关闭")

if __name__ == "__main__":
    run_server()