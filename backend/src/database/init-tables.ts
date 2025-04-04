import { createConnection } from 'typeorm';
import * as mysql from 'mysql2/promise';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { dataSourceOptions } from '../config/typeorm.config';
import * as path from 'path';
import * as fs from 'fs';

async function initDatabase() {
    try {
        console.log('Starting database initialization...');

        // Cast to MysqlConnectionOptions to access MySQL-specific properties
        const mysqlOptions = dataSourceOptions as MysqlConnectionOptions;

        // Connect to MySQL without specifying the database
        const connection = await mysql.createConnection({
            host: mysqlOptions.host,
            user: mysqlOptions.username,
            password: mysqlOptions.password,
            port: mysqlOptions.port
        });

        console.log('Connected to MySQL server');

        // Create database if it doesn't exist
        const dbName = mysqlOptions.database;
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`Ensured database ${dbName} exists`);

        // Connect to the database
        await connection.query(`USE \`${dbName}\``);

        // Create tables based on entities
        console.log('Creating tables...');

        // Create customers table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`customers\` (
                \`customer_id\` int NOT NULL AUTO_INCREMENT,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL UNIQUE,
                \`password_hash\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NULL,
                \`role\` varchar(255) NOT NULL DEFAULT 'customer',
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                \`last_login\` datetime NULL,
                PRIMARY KEY (\`customer_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Customers table created or already exists');

        // Create categories table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`categories\` (
                \`category_id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`parent_category_id\` int NULL,
                \`image_url\` varchar(255) NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`category_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Categories table created or already exists');

        // Add foreign key to categories table
        await connection.query(`
            ALTER TABLE \`categories\` 
            ADD CONSTRAINT \`FK_parent_category\` 
            FOREIGN KEY (\`parent_category_id\`) 
            REFERENCES \`categories\`(\`category_id\`) 
            ON DELETE SET NULL
        `).catch(err => {
            // If the foreign key already exists, that's fine
            console.log('Foreign key already exists or could not be added:', err.message);
        });

        // Create products table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`products\` (
                \`product_id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NOT NULL,
                \`base_price\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`sale_price\` decimal(10,2) NULL,
                \`sku\` varchar(255) NOT NULL,
                \`stock_quantity\` int NOT NULL,
                \`is_featured\` tinyint NOT NULL DEFAULT 0,
                \`metal_type\` varchar(255) NULL,
                \`gemstone_type\` varchar(255) NULL,
                \`weight\` decimal(10,2) NULL,
                \`dimensions\` varchar(255) NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`product_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Products table created or already exists');

        // Create product_category table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`product_category\` (
                \`product_id\` int NOT NULL,
                \`category_id\` int NOT NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`product_id\`, \`category_id\`),
                CONSTRAINT \`FK_product_category_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_product_category_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('ProductCategory table created or already exists');

        // Create orders table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`orders\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`customer_id\` int NULL,
                \`total_amount\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`total\` decimal(10,2) NOT NULL DEFAULT '0.00',
                \`status\` varchar(255) NOT NULL,
                \`shipping_address_id\` int NULL,
                \`billing_address_id\` int NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_orders_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Orders table created or already exists');

        // Create order_items table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`order_items\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`order_id\` int NOT NULL,
                \`product_id\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`quantity\` int NOT NULL,
                \`price\` decimal(10,2) NOT NULL,
                \`unit_price\` decimal(10,2) NOT NULL,
                \`total_price\` decimal(10,2) NOT NULL,
                \`customization_details\` text NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_order_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('OrderItems table created or already exists');

        // Create product_image table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`product_image\` (
                \`image_id\` int NOT NULL AUTO_INCREMENT,
                \`product_id\` int NOT NULL,
                \`image_url\` varchar(255) NOT NULL,
                \`is_primary\` tinyint NOT NULL DEFAULT 0,
                \`sort_order\` int NOT NULL DEFAULT 0,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`image_id\`),
                CONSTRAINT \`FK_product_image_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('ProductImage table created or already exists');

        // Create reviews table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`review\` (
                \`review_id\` int NOT NULL AUTO_INCREMENT,
                \`product_id\` int NOT NULL,
                \`customer_id\` int NULL,
                \`rating\` int NOT NULL,
                \`comment\` text NULL,
                \`status\` varchar(255) NOT NULL DEFAULT 'pending',
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`review_id\`),
                CONSTRAINT \`FK_review_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_review_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Review table created or already exists');

        // Create wishlist table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`wishlist\` (
                \`wishlist_id\` int NOT NULL AUTO_INCREMENT,
                \`customer_id\` int NOT NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`wishlist_id\`),
                CONSTRAINT \`FK_wishlist_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('Wishlist table created or already exists');

        // Create wishlist_item table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS \`wishlist_item\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`wishlist_id\` int NOT NULL,
                \`product_id\` int NOT NULL,
                \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deleted_at\` datetime NULL,
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_wishlist_item_wishlist\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\`(\`wishlist_id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_wishlist_item_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        console.log('WishlistItem table created or already exists');

        // Close the connection
        await connection.end();
        console.log('Database initialization completed successfully');

    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Run the initialization
initDatabase(); 