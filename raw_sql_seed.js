const { Client, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
const bcrypt = require('bcryptjs');

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = "postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function runSeed() {
    const client = new Client(DATABASE_URL);
    try {
        await client.connect();
        console.log('Connected to Neon via raw Client.');

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const now = new Date().toISOString();

        // 1. Create a Store if not exists
        const storeName = 'AROMIX Signature';
        const storeRes = await client.query("SELECT id FROM \"Store\" WHERE name = $1 LIMIT 1", [storeName]);
        let storeId;

        if (storeRes.rows.length === 0) {
            const insertStore = await client.query(
                "INSERT INTO \"Store\" (id, name, address, phone, \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                ['store_' + Date.now(), storeName, 'Jakarta Heritage', '08123', now, now]
            );
            storeId = insertStore.rows[0].id;
            console.log('Created Store:', storeId);
        } else {
            storeId = storeRes.rows[0].id;
            console.log('Found Store:', storeId);
        }

        // 2. Create Owner Account
        const ownerEmail = 'owner.final@aromix.id';
        await client.query("DELETE FROM \"User\" WHERE email = $1", [ownerEmail]);
        await client.query(
            "INSERT INTO \"User\" (id, email, password, name, role, \"storeId\", \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            ['user_' + Date.now(), ownerEmail, hashedPassword, 'Owner AROMIX (Final)', 'OWNER', storeId, now, now]
        );
        console.log('Created Owner:', ownerEmail);

        // 3. Create Admin Account
        const adminEmail = 'admin.final@aromix.id';
        await client.query("DELETE FROM \"User\" WHERE email = $1", [adminEmail]);
        await client.query(
            "INSERT INTO \"User\" (id, email, password, name, role, \"storeId\", \"createdAt\", \"updatedAt\") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            ['user_admin_' + Date.now(), adminEmail, hashedPassword, 'Super Admin (Final)', 'ADMIN', null, now, now]
        );
        console.log('Created Admin:', adminEmail);

        console.log('--- RAW SQL SEEDING SUCCESS ---');

    } catch (err) {
        console.error('RAW SQL SEEDING FAIL:', err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

runSeed();
