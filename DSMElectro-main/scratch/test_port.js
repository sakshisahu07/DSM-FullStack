import http from 'http';
const server = http.createServer((req, res) => {
  res.end('ok');
});
server.listen(2000, () => {
  console.log('Listening on 2000');
});
server.on('error', (err) => {
  console.error('Server error:', err);
});
