import http.server
import socketserver
import mimetypes
import os

PORT = 8888

# 添加JavaScript MIME类型
mimetypes.add_type('application/javascript', '.js')

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 确保CORS头被设置
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()
    
    def log_message(self, format, *args):
        # 更详细的日志
        print(f"[{self.log_date_time_string()}] {args[0]} {args[1]} {args[2]}")

# 确保服务器从正确的目录运行
directory = os.path.dirname(os.path.abspath(__file__))
os.chdir(directory)

print("========================================")
print(f"Starting Python server on port {PORT}...")
print(f"Server will run from: {directory}")
print(f"Server address: http://localhost:{PORT}")
print("MIME types configured:")
print(f"  .js -> {mimetypes.guess_type('test.js')[0]}")
print(f"  .html -> {mimetypes.guess_type('test.html')[0]}")
print(f"  .css -> {mimetypes.guess_type('test.css')[0]}")
print("========================================")

try:
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped by user.")
except Exception as e:
    print(f"Error starting server: {e}")
