from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os

PORT = 8080
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) or os.getcwd()
VIDEO_DIR = os.path.join(SCRIPT_DIR, 'my-app', 'public')

# Variable globale
isShutdown = False

# Pages HTML
def page_error():
    return b'''<html>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;font-size:4rem;font-weight:bold;background:#1a1a2e;color:#ef4444;margin:0;flex-direction:column;">
<style>@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0.3}} div{animation:blink 0.5s infinite;}</style>
<div>SYSTEM ERROR</div>
</body></html>'''

def page_a():
    return b'''<html>
<head><meta charset="UTF-8"></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;margin:0;overflow:hidden;">
<style>
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0.3}}
.error{animation:blink 0.5s infinite;}
video{width:100%;height:100%;object-fit:cover;}
#errorMsg{display:none;color:#ef4444;font-size:4rem;font-weight:bold;font-family:sans-serif;}
</style>
<video id="video" autoplay muted loop playsinline>
    <source src="/video/camera-1.mp4" type="video/mp4">
</video>
<div id="errorMsg">SYSTEM ERROR</div>
<script>
function checkStatus() {
    fetch('/status').then(r => r.json()).then(data => {
        const video = document.getElementById('video');
        const error = document.getElementById('errorMsg');
        if (data.isShutdown) {
            video.style.display = 'none';
            error.style.display = 'block';
            error.className = 'error';
        } else {
            video.style.display = 'block';
            error.style.display = 'none';
        }
    });
}
checkStatus();
setInterval(checkStatus, 500);
</script>
</body></html>'''

def page_b():
    return b'''<html>
<head><meta charset="UTF-8"></head>
<body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;margin:0;overflow:hidden;">
<style>
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0.3}}
.error{animation:blink 0.5s infinite;}
video{width:100%;height:100%;object-fit:cover;}
#errorMsg{display:none;color:#ef4444;font-size:4rem;font-weight:bold;font-family:sans-serif;}
</style>
<video id="video" autoplay muted loop playsinline>
    <source src="/video/camera-2.mp4" type="video/mp4">
</video>
<div id="errorMsg">SYSTEM ERROR</div>
<script>
function checkStatus() {
    fetch('/status').then(r => r.json()).then(data => {
        const video = document.getElementById('video');
        const error = document.getElementById('errorMsg');
        if (data.isShutdown) {
            video.style.display = 'none';
            error.style.display = 'block';
            error.className = 'error';
        } else {
            video.style.display = 'block';
            error.style.display = 'none';
        }
    });
}
checkStatus();
setInterval(checkStatus, 500);
</script>
</body></html>'''

def page_admin():
    return b'''<html>
<head><meta charset="UTF-8"></head>
<body style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#1a1a2e;color:white;font-family:sans-serif;margin:0;">
<h1 style="color:#e94560;margin-bottom:2rem;">Admin Panel</h1>
<div id="status" style="font-size:1.5rem;margin-bottom:2rem;padding:1rem 2rem;background:#16213e;border-radius:8px;"></div>
<div style="display:flex;gap:1rem;">
    <button onclick="setShutdown(true)" style="padding:1rem 2rem;font-size:1.2rem;font-weight:bold;border:none;border-radius:8px;cursor:pointer;background:#ef4444;color:white;">Activate Error</button>
    <button onclick="setShutdown(false)" style="padding:1rem 2rem;font-size:1.2rem;font-weight:bold;border:none;border-radius:8px;cursor:pointer;background:#4ade80;color:#1a1a2e;">Reset</button>
</div>
<script>
function updateStatus() {
    fetch('/status').then(r => r.json()).then(data => {
        document.getElementById('status').innerHTML =
            '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:10px;background:' +
            (data.isShutdown ? '#ef4444' : '#4ade80') + '"></span>Status: <strong>' +
            (data.isShutdown ? 'SHUTDOWN' : 'OPERATIONAL') + '</strong>';
    });
}
function setShutdown(value) {
    fetch('/updateState', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({shutdown: value})
    }).then(() => updateStatus());
}
updateStatus();
setInterval(updateStatus, 500);
</script>
</body></html>'''

def page_index():
    return b'''<html>
<body style="background:#1a1a2e;color:white;padding:2rem;font-family:sans-serif;">
<h1>Server Python</h1>
<ul>
    <li><a href="/a" style="color:#4ade80;">Page A</a></li>
    <li><a href="/b" style="color:#e94560;">Page B</a></li>
    <li><a href="/admin" style="color:#fbbf24;">Admin Panel</a></li>
</ul>
</body></html>'''

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        global isShutdown

        # Serve video files avec support Range (streaming)
        if self.path.startswith('/video/'):
            filename = self.path.replace('/video/', '')
            filepath = os.path.join(VIDEO_DIR, filename)

            if not os.path.exists(filepath):
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Video not found')
                return

            file_size = os.path.getsize(filepath)
            range_header = self.headers.get('Range')

            if range_header:
                # Support Range requests pour le streaming video
                byte_range = range_header.replace('bytes=', '').split('-')
                start = int(byte_range[0])
                end = int(byte_range[1]) if byte_range[1] else file_size - 1
                length = end - start + 1

                self.send_response(206)
                self.send_header('Content-type', 'video/mp4')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
                self.send_header('Content-Length', length)
                self.end_headers()

                with open(filepath, 'rb') as f:
                    f.seek(start)
                    self.wfile.write(f.read(length))
            else:
                # Requête normale
                self.send_response(200)
                self.send_header('Content-type', 'video/mp4')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Content-Length', file_size)
                self.end_headers()

                with open(filepath, 'rb') as f:
                    self.wfile.write(f.read())
            return

        self.send_response(200)

        if self.path == '/status':
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'isShutdown': isShutdown}).encode())
        elif self.path == '/a':
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(page_error() if isShutdown else page_a())
        elif self.path == '/b':
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(page_error() if isShutdown else page_b())
        elif self.path == '/admin':
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(page_admin())
        else:
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(page_index())

    def do_POST(self):
        global isShutdown
        if self.path == '/updateState':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode())

            if 'shutdown' in data:
                isShutdown = data['shutdown']
                print(f'[Server] isShutdown = {isShutdown}')

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'isShutdown': isShutdown}).encode())

if __name__ == '__main__':
    print(f'VIDEO_DIR: {VIDEO_DIR}')
    print(f'Videos disponibles: {os.listdir(VIDEO_DIR) if os.path.exists(VIDEO_DIR) else "DOSSIER NON TROUVE"}')
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f'Serveur Python accessible sur:')
    print(f'  Local:   http://localhost:{PORT}')
    print(f'  Réseau:  http://10.14.73.129:{PORT}')
    print(f'\nRoutes:')
    print(f'  /       - Index')
    print(f'  /a      - Page A')
    print(f'  /b      - Page B')
    print(f'  /admin  - Panel Admin (controle isShutdown)')
    print(f'  /status - API status JSON')
    server.serve_forever()
