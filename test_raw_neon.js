const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

console.log('Testing raw Neon connection...');
const pool = new Pool({ connectionString: DATABASE_URL });

pool.query('SELECT NOW()')
    .then(res => {
        console.log('SUCCESS:', res.rows[0]);
        pool.end();
    })
    .catch(err => {
        console.error('FAILURE:', err.message);
        console.error('Full Error:', err);
        pool.end();
    });
