const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 3000; // Certifique-se de que esta porta está permitida no firewall

const server = http.createServer((req, res) => {
  // Construindo o caminho do arquivo baseado na requisição
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  let extname = String(path.extname(filePath)).toLowerCase();
  
  // Mapeamento de tipos MIME
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  
  // Tipo MIME padrão
  let contentType = mimeTypes[extname] || 'application/octet-stream';

  // Leitura e envio do arquivo
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code == 'ENOENT') {
        // Página não encontrada
        fs.readFile('./404.html', (error, content) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        });
      } else {
        // Algum erro do servidor
        res.writeHead(500);
        res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      }
    } else {
      // Sucesso
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running and accessible on LAN at http://10.1.1.7:${port}/`);
});