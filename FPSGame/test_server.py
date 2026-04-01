import http.server
import socketserver
import mimetypes

PORT = 8888

# 确保JavaScript文件有正确的MIME类型
mimetypes.types_map['.js'] = 'application/javascript'
mimetypes.types_map['.html'] = 'text/html'

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"{args[0]} {args[1]} {args[2]}")

print(f"Starting server on port {PORT}...")
print(f"Server running at http://localhost:{PORT}/game.html")
print("JavaScript MIME type: application/javascript")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("Server stopped.")
