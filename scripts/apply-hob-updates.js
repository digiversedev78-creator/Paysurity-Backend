const { DataSource } = require('typeorm');
const fs = require('fs');
const path = require('path');

async function run() {
    const sqlPath = path.join(__dirname, '../HouseOfBiryani/updates_final.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('SQL file not found at', sqlPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    const statements = sql.split(';').filter(s => s.trim().length > 0);

    console.log(`Connecting to database to apply ${statements.length} updates...`);

    const AppDataSource = process.env.DATABASE_URL ? 
        new DataSource({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            synchronize: false,
            logging: true,
        }) :
        new DataSource({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'paysurity',
            synchronize: false,
            logging: true,
        });

    try {
        await AppDataSource.initialize();
        console.log('Database initialized.');

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await AppDataSource.query(statement);
        }

        console.log('All updates applied successfully.');
    } catch (err) {
        console.error('Error applying updates:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

run();
