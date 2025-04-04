import * as mysql from 'mysql2/promise';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { dataSourceOptions } from '../config/typeorm.config';
import * as bcrypt from 'bcrypt';

async function seedDatabase() {
    try {
        console.log('Starting database seeding...');

        // Cast to MysqlConnectionOptions to access MySQL-specific properties
        const mysqlOptions = dataSourceOptions as MysqlConnectionOptions;

        // Connect to MySQL with the database
        const connection = await mysql.createConnection({
            host: mysqlOptions.host,
            user: mysqlOptions.username,
            password: mysqlOptions.password,
            port: mysqlOptions.port,
            database: mysqlOptions.database
        });

        console.log('Connected to MySQL database');

        // Check if admin user exists
        const [adminRows] = await connection.query(
            `SELECT * FROM \`customers\` WHERE \`email\` = 'tramnguyen040404@gmail.com' LIMIT 1`
        );

        const adminExists = Array.isArray(adminRows) && adminRows.length > 0;

        if (!adminExists) {
            // Create admin user
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash('123456', saltRounds);

            await connection.query(
                `INSERT INTO \`customers\` (\`first_name\`, \`last_name\`, \`email\`, \`password_hash\`, \`role\`)
                 VALUES (?, ?, ?, ?, ?)`,
                ['Admin', 'User', 'tramnguyen040404@gmail.com', passwordHash, 'admin']
            );
            console.log('Default admin user created');
        } else {
            console.log('Admin user already exists');
        }

        // Close the connection
        await connection.end();
        console.log('Database seeding completed successfully');

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeding
seedDatabase();
