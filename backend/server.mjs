// server.mjs
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Servidor Node.js funcionando\n');
});

server.listen(5000, '127.0.0.1', () => {
  console.log('Servidor Node.js escuchando en http://127.0.0.1:5000');
});
