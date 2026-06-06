const { createClient } = require('redis');
async function flush() {
  const client = createClient();
  await client.connect();
  await client.flushAll();
  console.log('flushed');
  process.exit(0);
}
flush();
