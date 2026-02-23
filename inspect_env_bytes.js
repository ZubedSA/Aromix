const fs = require('fs');
const buffer = fs.readFileSync('.env');
console.log('Byte Length:', buffer.length);
console.log('First 10 Bytes (Hex):', buffer.slice(0, 10).toString('hex'));
console.log('Last 10 Bytes (Hex):', buffer.slice(buffer.length - 10).toString('hex'));
