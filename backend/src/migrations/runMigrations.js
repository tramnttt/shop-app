const { execSync } = require('child_process');
const path = require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Starting database setup process...');

// Database connection config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '17932486',
    database: process.env.DB_DATABASE || 'jewelry_shop',
    multipleStatements: true
};

// Create a connection
const connection = mysql.createConnection(dbConfig);

try {
    // Connect to the database
    connection.connect();

    console.log('Connected to the database. Creating base tables...');

    // Read the InitialDbSetup migration file to extract SQL statements
    const migrationFile = fs.readFileSync(path.resolve(__dirname, './1743744927552-InitialDbSetup.ts'), 'utf8');

    // Extract SQL statements from the migration file (this is a simplistic extraction that works for our case)
    const createTableStatements = migrationFile
        .split('await queryRunner.query(`')
        .filter(part => part.trim().startsWith('CREATE TABLE'))
        .map(part => part.split('`);')[0]);

    // Execute each CREATE TABLE statement
    createTableStatements.forEach((statement, index) => {
        console.log(`Executing create table statement ${index + 1}/${createTableStatements.length}...`);
        connection.query(statement, (err, results) => {
            if (err) {
                console.error(`Error executing statement: ${err.message}`);
                console.log('Statement:', statement);
            }
        });
    });

    console.log('Base tables created. Now running the migrations...');

    // Close the connection
    connection.end();

    // Now run the migration system which will apply remaining migrations
    console.log('Running migrations through TypeORM...');
    execSync('npm run migration:run', { stdio: 'inherit', cwd: path.resolve(__dirname, '../../') });

    console.log('Database setup completed successfully!');

} catch (error) {
    console.error('Database setup failed:', error.message);

    if (connection) {
        connection.end();
    }

    process.exit(1);
} 