const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../build');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.otf':'font/otf','.woff':'font/woff','.woff2':'font/woff2','.ico':'image/x-icon'};
if (!fs.existsSync(path.join(root,'index.html'))) {console.error('请先运行 npm run build / Run npm run build first.');process.exit(1);}
const server = http.createServer((req,res) => {
 let pathname; try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);return res.end();}
 const target=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));
 if(!target.startsWith(root+path.sep)) {res.writeHead(403);return res.end();}
 fs.readFile(target,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');} res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);});
});
server.on('error',error=>{console.error('启动失败 / Server failed:',error.message);process.exitCode=1;});
server.listen(3000,'127.0.0.1',()=>console.log('磷光终端已启动 / PHOSPHOR: http://127.0.0.1:3000 — 关闭窗口停止服务 / Ctrl+C to stop'));
