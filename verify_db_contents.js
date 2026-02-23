const { Client, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function verify() {
    const client = new Client(DATABASE_URL);
    try {
        await client.connect();
        console.log('--- DB INSPECTION START ---');

        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', tables.rows.map(r => r.table_name).join(', '));

        const users = await client.query("SELECT id, email, role, name FROM \"User\"");
        console.log('Users in table:', JSON.stringify(users.rows, null, 2));

        const stores = await client.query("SELECT id, name FROM \"Store\"");
        console.log('Stores in table:', JSON.stringify(stores.rows, null, 2));

        console.log('--- DB INSPECTION END ---');
    } catch (err) {
        console.error('VERIFICATION FAIL:', err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

verify();
