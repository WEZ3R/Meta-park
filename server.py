from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
import time

PORT = 8080
START_TIME = time.time()
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) or os.getcwd()
VIDEO_DIR = os.path.join(SCRIPT_DIR, 'my-app', 'public')

isShutdown = False
currentCamera = 1

VIEWER_HTML = '''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Viewer</title></head>
<body style="margin:0;overflow:hidden;background:#000;">
<style>
.video-container{position:relative;width:100vw;height:100vh;}
video{position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:1;}
video.active{z-index:10;}
#indicator{position:fixed;top:20px;left:20px;background:rgba(0,0,0,0.7);color:white;padding:10px 20px;border-radius:8px;font-family:sans-serif;font-size:1.2rem;opacity:0;transition:opacity 0.3s;z-index:20;}
#indicator.show{opacity:1;}
</style>
<div class="video-container">
    <video id="v1" src="/video/camera-1.mp4" autoplay muted loop playsinline class="active"></video>
    <video id="v2" src="/video/camera-2.mp4" autoplay muted loop playsinline></video>
    <video id="v3" src="/video/camera-3.mp4" autoplay muted loop playsinline></video>
    <video id="v4" src="/video/camera-4.mp4" autoplay muted loop playsinline></video>
</div>
<div id="indicator">Camera 1</div>
<audio id="camSound" src="/video/FNAF_cam.mp3" preload="auto"></audio>
<script>
var cam = 1;
var snd = document.getElementById('camSound');
snd.volume = 1.0;
function sw(n) {
    if (n == cam) return;
    snd.currentTime = 0;
    snd.play().catch(function(){});
    document.getElementById('v'+cam).classList.remove('active');
    document.getElementById('v'+n).classList.add('active');
    cam = n;
    var x = new XMLHttpRequest();
    x.open('POST','/setCamera');
    x.setRequestHeader('Content-Type','application/json');
    x.send('{"camera":'+n+'}');
    var ind = document.getElementById('indicator');
    ind.textContent = 'Camera ' + n;
    ind.classList.add('show');
    setTimeout(function(){ind.classList.remove('show');},1500);
}
document.onkeydown = function(e) {
    var k = e.key.toLowerCase();
    if (k=='1'||k=='a') sw(1);
    if (k=='2'||k=='b') sw(2);
    if (k=='3'||k=='c') sw(3);
    if (k=='4'||k=='d') sw(4);
};
document.getElementById('indicator').classList.add('show');
setTimeout(function(){document.getElementById('indicator').classList.remove('show');},1500);
function syncVideos() {
    var x = new XMLHttpRequest();
    x.open('GET','/status');
    x.onload = function() {
        var d = JSON.parse(x.responseText);
        var elapsed = d.serverTime - d.startTime;
        for (var i=1;i<=4;i++) {
            var v = document.getElementById('v'+i);
            if (v.duration && v.duration > 0) {
                var target = elapsed % v.duration;
                if (Math.abs(v.currentTime - target) > 0.3) {
                    v.currentTime = target;
                }
            }
        }
    };
    x.send();
}
setTimeout(syncVideos, 1000);
setInterval(syncVideos, 3000);
</script>
</body></html>'''

QUAD_HTML = '''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Quad</title></head>
<body style="margin:0;padding:10px;background:#000;height:100vh;box-sizing:border-box;">
<style>
.grid{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;height:100%;}
.cam{position:relative;border:4px solid #333;border-radius:8px;overflow:hidden;}
.cam video{width:100%;height:100%;object-fit:cover;}
.lbl{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.7);color:white;padding:5px 12px;border-radius:4px;font-family:sans-serif;font-weight:bold;}
</style>
<div class="grid">
    <div class="cam" id="c1"><div class="lbl" id="l1">Camera 1</div><video autoplay muted loop playsinline><source src="/video/camera-1.mp4" type="video/mp4"></video></div>
    <div class="cam" id="c2"><div class="lbl" id="l2">Camera 2</div><video autoplay muted loop playsinline><source src="/video/camera-2.mp4" type="video/mp4"></video></div>
    <div class="cam" id="c3"><div class="lbl" id="l3">Camera 3</div><video autoplay muted loop playsinline><source src="/video/camera-3.mp4" type="video/mp4"></video></div>
    <div class="cam" id="c4"><div class="lbl" id="l4">Camera 4</div><video autoplay muted loop playsinline><source src="/video/camera-4.mp4" type="video/mp4"></video></div>
</div>
<script>
var lastElapsed = 0;
function poll() {
    var x = new XMLHttpRequest();
    x.open('GET','/status');
    x.onload = function() {
        var d = JSON.parse(x.responseText);
        var a = d.currentCamera;
        lastElapsed = d.serverTime - d.startTime;
        for (var i=1;i<=4;i++) {
            var c = document.getElementById('c'+i);
            var l = document.getElementById('l'+i);
            if (i==a) {
                c.style.borderColor='#4ade80';
                c.style.boxShadow='0 0 20px rgba(74,222,128,0.5)';
                l.style.background='#4ade80';
                l.style.color='#000';
            } else {
                c.style.borderColor='#333';
                c.style.boxShadow='none';
                l.style.background='rgba(0,0,0,0.7)';
                l.style.color='white';
            }
        }
    };
    x.send();
}
function syncVideos() {
    if (!lastElapsed) return;
    var videos = document.querySelectorAll('video');
    videos.forEach(function(v) {
        if (v.duration && v.duration > 0) {
            var target = lastElapsed % v.duration;
            if (Math.abs(v.currentTime - target) > 0.3) {
                v.currentTime = target;
            }
        }
    });
}
poll();
setInterval(poll, 100);
setTimeout(syncVideos, 1000);
setInterval(syncVideos, 3000);
</script>
</body></html>'''

ADMIN_HTML = '''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Admin</title></head>
<body style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#1a1a2e;color:white;font-family:sans-serif;margin:0;">
<h1 style="color:#e94560;">Admin Panel</h1>
<div id="st" style="font-size:1.5rem;margin:1rem;padding:1rem 2rem;background:#16213e;border-radius:8px;"></div>
<div id="cm" style="font-size:1.2rem;margin-bottom:2rem;padding:0.8rem 1.5rem;background:#16213e;border-radius:8px;"></div>
<div style="display:flex;gap:1rem;">
    <button onclick="shut(true)" style="padding:1rem 2rem;font-size:1.2rem;border:none;border-radius:8px;cursor:pointer;background:#ef4444;color:white;">Error ON</button>
    <button onclick="shut(false)" style="padding:1rem 2rem;font-size:1.2rem;border:none;border-radius:8px;cursor:pointer;background:#4ade80;color:#000;">Error OFF</button>
</div>
<script>
function upd() {
    var x = new XMLHttpRequest();
    x.open('GET','/status');
    x.onload = function() {
        var d = JSON.parse(x.responseText);
        document.getElementById('st').innerHTML = 'Status: <b>' + (d.isShutdown?'SHUTDOWN':'OK') + '</b>';
        document.getElementById('cm').innerHTML = 'Camera: <b>' + d.currentCamera + '</b>';
    };
    x.send();
}
function shut(v) {
    var x = new XMLHttpRequest();
    x.open('POST','/updateState');
    x.setRequestHeader('Content-Type','application/json');
    x.onload = upd;
    x.send('{"shutdown":'+v+'}');
}
upd();
setInterval(upd, 500);
</script>
</body></html>'''

LOGIN_HTML = '''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Login</title></head>
<body style="margin:0;height:100vh;background:url('/img/Frame 515.png') center/cover no-repeat;display:flex;justify-content:center;align-items:center;">
<div style="background:rgba(0,0,0,0.7);padding:2rem;border-radius:12px;text-align:center;">
    <input type="password" id="pwd" placeholder="Mot de passe" style="padding:1rem;font-size:1.2rem;border:none;border-radius:8px;width:200px;text-align:center;" onkeydown="if(event.key=='Enter')go()">
    <br><br>
    <button onclick="go()" style="padding:0.8rem 2rem;font-size:1rem;border:none;border-radius:8px;cursor:pointer;background:#4ade80;color:#000;">Entrer</button>
</div>
<script>
function go() {
    var p = document.getElementById('pwd').value;
    if (p === '1234') {
        window.location.href = '/viewer';
    } else {
        alert('Mot de passe incorrect');
    }
}
</script>
</body></html>'''

INDEX_HTML = '''<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>ServerMetaPark</title></head>
<body style="background:#1a1a2e;color:white;padding:2rem;font-family:sans-serif;">
<h1>Server</h1>
<ul>
    <li><a href="/viewer" style="color:#4ade80;">Viewer</a></li>
    <li><a href="/quad" style="color:#3b82f6;">Quad</a></li>
    <li><a href="/admin" style="color:#fbbf24;">Admin</a></li>
</ul>
</body></html>'''

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        global isShutdown, currentCamera

        if self.path.startswith('/img/'):
            filename = self.path[5:]
            filepath = os.path.join(VIDEO_DIR, filename)
            if not os.path.exists(filepath):
                self.send_response(404)
                self.end_headers()
                return
            self.send_response(200)
            self.send_header('Content-type','image/png')
            self.send_header('Content-Length',os.path.getsize(filepath))
            self.end_headers()
            with open(filepath,'rb') as f:
                self.wfile.write(f.read())
            return

        if self.path.startswith('/video/'):
            filename = self.path[7:]
            filepath = os.path.join(VIDEO_DIR, filename)
            if not os.path.exists(filepath):
                self.send_response(404)
                self.end_headers()
                return
            ctype = 'audio/mpeg' if filename.endswith('.mp3') else 'audio/ogg' if filename.endswith('.ogg') else 'video/mp4'
            file_size = os.path.getsize(filepath)
            rng = self.headers.get('Range')
            if rng:
                parts = rng.replace('bytes=','').split('-')
                start = int(parts[0])
                end = int(parts[1]) if parts[1] else file_size-1
                self.send_response(206)
                self.send_header('Content-type',ctype)
                self.send_header('Content-Range','bytes %d-%d/%d'%(start,end,file_size))
                self.send_header('Content-Length',end-start+1)
                self.end_headers()
                with open(filepath,'rb') as f:
                    f.seek(start)
                    self.wfile.write(f.read(end-start+1))
            else:
                self.send_response(200)
                self.send_header('Content-type',ctype)
                self.send_header('Content-Length',file_size)
                self.end_headers()
                with open(filepath,'rb') as f:
                    self.wfile.write(f.read())
            return

        self.send_response(200)
        if self.path == '/status':
            self.send_header('Content-type','application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'isShutdown':isShutdown,'currentCamera':currentCamera,'startTime':START_TIME,'serverTime':time.time()}).encode())
        elif self.path == '/viewer':
            self.send_header('Content-type','text/html')
            self.end_headers()
            self.wfile.write(VIEWER_HTML.encode())
        elif self.path == '/quad':
            self.send_header('Content-type','text/html')
            self.end_headers()
            self.wfile.write(QUAD_HTML.encode())
        elif self.path == '/admin':
            self.send_header('Content-type','text/html')
            self.end_headers()
            self.wfile.write(ADMIN_HTML.encode())
        elif self.path == '/login':
            self.send_header('Content-type','text/html')
            self.end_headers()
            self.wfile.write(LOGIN_HTML.encode())
        else:
            self.send_header('Content-type','text/html')
            self.end_headers()
            self.wfile.write(INDEX_HTML.encode())

    def do_POST(self):
        global isShutdown, currentCamera
        length = int(self.headers['Content-Length'])
        data = json.loads(self.rfile.read(length).decode())
        if self.path == '/updateState' and 'shutdown' in data:
            isShutdown = data['shutdown']
            print('[Server] isShutdown =', isShutdown)
        if self.path == '/setCamera' and 'camera' in data:
            currentCamera = int(data['camera'])
            print('[Server] currentCamera =', currentCamera)
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

if __name__ == '__main__':
    print('Port:', PORT)
    print('Videos:', VIDEO_DIR)
    HTTPServer(('0.0.0.0', PORT), Handler).serve_forever()
