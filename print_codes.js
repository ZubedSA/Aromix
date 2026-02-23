const fs = require('fs');
const data = JSON.parse(fs.readFileSync('diag_raw.json', 'utf8'));
console.log('Codes:', data.raw_codes.join(', '));
console.log('Hex:', data.raw_codes.map(c => c.toString(16).toUpperCase()).join(' '));
