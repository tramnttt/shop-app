const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Database connection config
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '17932486',
    database: process.env.DB_DATABASE || 'jewelry_shop',
    multipleStatements: true // Important for executing multiple SQL statements
};

console.log('Starting database initialization...');
console.log(`Connecting to database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);

// Create a connection
const connection = mysql.createConnection(dbConfig);

// Read SQL file
const sqlFilePath = path.resolve(__dirname, './InitDb.sql');
const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

// Connect and execute SQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }

    console.log('Connected to the database. Executing SQL script...');

    connection.query(sqlScript, (error, results) => {
        if (error) {
            console.error('Error executing SQL script:', error);
            connection.end();
            process.exit(1);
        }

        console.log('SQL script executed successfully.');
        console.log('Database initialization completed.');

        connection.end((endError) => {
            if (endError) {
                console.error('Error ending database connection:', endError);
                process.exit(1);
            }

            console.log('Database connection closed.');
        });
    });
}); 