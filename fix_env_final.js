const fs = require('fs');
const content = `DATABASE_URL=postgresql://neondb_owner:npg_WLj2dPp4IwaV@ep-proud-surf-a14omkz8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_SECRET=AROMIX_PREMIUM_SECRET_KEY_2026
NEXTAUTH_URL=http://localhost:3000`;

// Use absolute path to ensure we're hitting the right file
const envPath = 'D:\\web\\AROMIX-Sistem\\.env';
fs.writeFileSync(envPath, content.trim(), { encoding: 'utf8' });
console.log(`.env file rewritten successfully at ${envPath}`);
