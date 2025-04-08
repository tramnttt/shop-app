import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialDbSetup1743744927552 implements MigrationInterface {
    name = 'InitialDbSetup1743744927552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if tables exist before creating them
        const tables = await queryRunner.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'jewelry_shop'
        `);
        const existingTables = tables.map((t: any) => t.TABLE_NAME.toLowerCase());

        // Helper function to create table if it doesn't exist
        const createTableIfNotExists = async (tableName: string, createQuery: string) => {
            if (!existingTables.includes(tableName.toLowerCase())) {
                await queryRunner.query(createQuery);
            }
        };

        // Create tables if they don't exist
        await createTableIfNotExists('customer', `CREATE TABLE \`customer\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`role\` varchar(255) NOT NULL DEFAULT 'customer', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`last_login\` datetime NULL, UNIQUE INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` (\`email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('wishlist', `CREATE TABLE \`wishlist\` (\`wishlist_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`wishlist_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('orders', `CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NULL, \`total_amount\` decimal(10,2) NOT NULL, \`total\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`shipping_address_id\` int NULL, \`billing_address_id\` int NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('order_items', `CREATE TABLE \`order_items\` (\`id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`product_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`price\` decimal(10,2) NOT NULL, \`unit_price\` decimal(10,2) NOT NULL, \`total_price\` decimal(10,2) NOT NULL, \`customization_details\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('review', `CREATE TABLE \`review\` (\`review_id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`customer_id\` int NULL, \`guest_name\` varchar(255) NULL, \`guest_email\` varchar(255) NULL, \`rating\` int NOT NULL, \`comment\` text NULL, \`is_verified_purchase\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`review_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('product_images', `CREATE TABLE \`product_images\` (\`image_id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`image_url\` varchar(255) NOT NULL, \`alt_text\` varchar(255) NULL, \`is_primary\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('categories', `CREATE TABLE \`categories\` (\`category_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`parent_category_id\` int NULL, \`image_url\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`category_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('product_category', `CREATE TABLE \`product_category\` (\`product_id\` int NOT NULL, \`category_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`product_id\`, \`category_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('products', `CREATE TABLE \`products\` (\`product_id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`base_price\` decimal(10,2) NOT NULL, \`sale_price\` decimal(10,2) NULL, \`sku\` varchar(255) NOT NULL, \`stock_quantity\` int NOT NULL, \`is_featured\` tinyint NOT NULL DEFAULT 0, \`metal_type\` varchar(255) NULL, \`gemstone_type\` varchar(255) NULL, \`weight\` decimal(10,2) NULL, \`dimensions\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`product_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('wishlist_item', `CREATE TABLE \`wishlist_item\` (\`wishlist_item_id\` int NOT NULL AUTO_INCREMENT, \`wishlist_id\` int NOT NULL, \`product_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`wishlist_item_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('shipping', `CREATE TABLE \`shipping\` (\`shipping_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`carrier\` varchar(255) NOT NULL, \`tracking_number\` varchar(255) NULL, \`shipping_cost\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`estimated_delivery\` datetime NULL, \`actual_delivery\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`shipping_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('customers', `CREATE TABLE \`customers\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`role\` varchar(255) NOT NULL DEFAULT 'customer', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`last_login\` datetime NULL, UNIQUE INDEX \`IDX_8536b8b85c06969f84f0c098b0\` (\`email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('product_image', `CREATE TABLE \`product_image\` (\`image_id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`image_url\` varchar(255) NOT NULL, \`alt_text\` varchar(255) NULL, \`is_primary\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('wishlist_items', `CREATE TABLE \`wishlist_items\` (\`wishlist_item_id\` int NOT NULL AUTO_INCREMENT, \`wishlist_id\` int NOT NULL, \`product_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`wishlist_item_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('wishlists', `CREATE TABLE \`wishlists\` (\`wishlist_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`wishlist_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('payment', `CREATE TABLE \`payment\` (\`payment_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`transaction_id\` varchar(255) NULL, \`amount\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`payment_date\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`payment_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('address', `CREATE TABLE \`address\` (\`address_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`address_line1\` varchar(255) NOT NULL, \`address_line2\` varchar(255) NULL, \`city\` varchar(255) NOT NULL, \`state\` varchar(255) NOT NULL, \`postal_code\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`is_default\` tinyint NOT NULL DEFAULT 0, \`address_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`address_id\`)) ENGINE=InnoDB`);

        await createTableIfNotExists('discounts', `CREATE TABLE \`discounts\` (\`discount_id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`description\` text NULL, \`amount\` decimal(10,2) NOT NULL, \`discount_type\` varchar(255) NOT NULL, \`usage_limit\` int NULL, \`times_used\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`start_date\` date NULL, \`end_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`discount_id\`)) ENGINE=InnoDB`);

        // Add foreign keys only if they don't exist
        const constraints = await queryRunner.query(`
            SELECT CONSTRAINT_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = 'jewelry_shop' 
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        `);
        const existingConstraints = constraints.map((c: any) => c.CONSTRAINT_NAME);

        // Helper function to add foreign key if it doesn't exist
        const addForeignKeyIfNotExists = async (constraintName: string, addQuery: string) => {
            if (!existingConstraints.includes(constraintName)) {
                try {
                    await queryRunner.query(addQuery);
                } catch (error) {
                    // If the error is not about duplicate constraint, rethrow it
                    if (!error.message.includes('Duplicate foreign key constraint')) {
                        throw error;
                    }
                }
            }
        };

        // Add foreign keys if they don't exist
        await addForeignKeyIfNotExists('FK_bf352c755492e9c5b14f36dbaa3',
            `ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_bf352c755492e9c5b14f36dbaa3\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_772d0ce0473ac2ccfa26060dbe9',
            `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_145532db85752b29c57d2b7b1f1',
            `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_9263386c35b6b242540f9493b00',
            `ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_26b533e15b5f2334c96339a1f08',
            `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_26b533e15b5f2334c96339a1f08\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_957d0d10b33ce8de57a0a01e483',
            `ALTER TABLE \`review\` ADD CONSTRAINT \`FK_957d0d10b33ce8de57a0a01e483\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_4f166bb8c2bfcef2498d97b4068',
            `ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_de08738901be6b34d2824a1e243',
            `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_de08738901be6b34d2824a1e243\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_0374879a971928bc3f57eed0a59',
            `ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_2df1f83329c00e6eadde0493e16',
            `ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_ac00077fd9942e77c6ad2b5bf71',
            `ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_ac00077fd9942e77c6ad2b5bf71\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\`(\`wishlist_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_928fbf35568fcab9681d8270792',
            `ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_928fbf35568fcab9681d8270792\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_a37456893780ce2dfe0a7484c22',
            `ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_a37456893780ce2dfe0a7484c22\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_dbc7d9aa7ed42c9141b968a9ed3',
            `ALTER TABLE \`product_image\` ADD CONSTRAINT \`FK_dbc7d9aa7ed42c9141b968a9ed3\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_754a9ecec7627d432c2134dd00e',
            `ALTER TABLE \`wishlist_items\` ADD CONSTRAINT \`FK_754a9ecec7627d432c2134dd00e\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlists\`(\`wishlist_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_177397e044732e7e9c0215cd5b7',
            `ALTER TABLE \`wishlist_items\` ADD CONSTRAINT \`FK_177397e044732e7e9c0215cd5b7\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_1ecae3acee67b8f1b5ae9f51498',
            `ALTER TABLE \`wishlists\` ADD CONSTRAINT \`FK_1ecae3acee67b8f1b5ae9f51498\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_f5221735ace059250daac9d9803',
            `ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_f5221735ace059250daac9d9803\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await addForeignKeyIfNotExists('FK_9c9614b2f9d01665800ea8dbff7',
            `ALTER TABLE \`address\` ADD CONSTRAINT \`FK_9c9614b2f9d01665800ea8dbff7\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // The down migration remains unchanged as it's safe to drop tables that don't exist
        await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_9c9614b2f9d01665800ea8dbff7\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_f5221735ace059250daac9d9803\``);
        await queryRunner.query(`ALTER TABLE \`wishlists\` DROP FOREIGN KEY \`FK_1ecae3acee67b8f1b5ae9f51498\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_177397e044732e7e9c0215cd5b7\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_items\` DROP FOREIGN KEY \`FK_754a9ecec7627d432c2134dd00e\``);
        await queryRunner.query(`ALTER TABLE \`product_image\` DROP FOREIGN KEY \`FK_dbc7d9aa7ed42c9141b968a9ed3\``);
        await queryRunner.query(`ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_a37456893780ce2dfe0a7484c22\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_928fbf35568fcab9681d8270792\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_ac00077fd9942e77c6ad2b5bf71\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_2df1f83329c00e6eadde0493e16\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_0374879a971928bc3f57eed0a59\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_de08738901be6b34d2824a1e243\``);
        await queryRunner.query(`ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_957d0d10b33ce8de57a0a01e483\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_26b533e15b5f2334c96339a1f08\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_bf352c755492e9c5b14f36dbaa3\``);
        await queryRunner.query(`DROP TABLE \`discounts\``);
        await queryRunner.query(`DROP TABLE \`address\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP TABLE \`wishlists\``);
        await queryRunner.query(`DROP TABLE \`wishlist_items\``);
        await queryRunner.query(`DROP TABLE \`product_image\``);
        await queryRunner.query(`DROP INDEX \`IDX_8536b8b85c06969f84f0c098b0\` ON \`customers\``);
        await queryRunner.query(`DROP TABLE \`customers\``);
        await queryRunner.query(`DROP TABLE \`shipping\``);
        await queryRunner.query(`DROP TABLE \`wishlist_item\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_category\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`product_images\``);
        await queryRunner.query(`DROP TABLE \`review\``);
        await queryRunner.query(`DROP TABLE \`order_items\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`wishlist\``);
        await queryRunner.query(`DROP INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` ON \`customer\``);
        await queryRunner.query(`DROP TABLE \`customer\``);
    }
}
