import http.server
import socketserver
import mimetypes

PORT = 8888

# 确保JavaScript文件有正确的MIME类型
mimetypes.types_map['.js'] = 'application/javascript'

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

print(f"Starting server on port {PORT}...")
print(f"Server running at http://localhost:{PORT}/game.html")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()