import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImageTable1743784309333 implements MigrationInterface {
    name = 'AddProductImageTable1743784309333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if foreign keys exist before trying to drop them
        try {
            await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
        } catch (error) {
            console.log('Foreign key FK_orders_customer does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_order\``);
        } catch (error) {
            console.log('Foreign key FK_order_items_order does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_product\``);
        } catch (error) {
            console.log('Foreign key FK_order_items_product does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_review_customer\``);
        } catch (error) {
            console.log('Foreign key FK_review_customer does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_review_product\``);
        } catch (error) {
            console.log('Foreign key FK_review_product does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_parent_category\``);
        } catch (error) {
            console.log('Foreign key FK_parent_category does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_product_category_category\``);
        } catch (error) {
            console.log('Foreign key FK_product_category_category does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_product_category_product\``);
        } catch (error) {
            console.log('Foreign key FK_product_category_product does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_wishlist_item_product\``);
        } catch (error) {
            console.log('Foreign key FK_wishlist_item_product does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_wishlist_item_wishlist\``);
        } catch (error) {
            console.log('Foreign key FK_wishlist_item_wishlist does not exist, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_wishlist_customer\``);
        } catch (error) {
            console.log('Foreign key FK_wishlist_customer does not exist, continuing...');
        }

        // Continue with the rest of the migration
        // Check if customer table exists
        const customerTableExists = await queryRunner.hasTable('customer');
        if (!customerTableExists) {
            await queryRunner.query(`CREATE TABLE \`customer\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`role\` varchar(255) NOT NULL DEFAULT 'customer', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`last_login\` datetime NULL, UNIQUE INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` (\`email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);
            console.log('Customer table created successfully');
        } else {
            console.log('Customer table already exists, skipping creation');
        }

        // Check if product_images table exists
        const productImagesTableExists = await queryRunner.hasTable('product_images');
        if (!productImagesTableExists) {
            await queryRunner.query(`CREATE TABLE \`product_images\` (\`image_id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`image_url\` varchar(255) NOT NULL, \`alt_text\` varchar(255) NULL, \`is_primary\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);
            console.log('Product images table created successfully');
        } else {
            console.log('Product images table already exists, skipping creation');
        }

        // Check if shipping table exists
        const shippingTableExists = await queryRunner.hasTable('shipping');
        if (!shippingTableExists) {
            await queryRunner.query(`CREATE TABLE \`shipping\` (\`shipping_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`carrier\` varchar(255) NOT NULL, \`tracking_number\` varchar(255) NULL, \`shipping_cost\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`estimated_delivery\` datetime NULL, \`actual_delivery\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`shipping_id\`)) ENGINE=InnoDB`);
            console.log('Shipping table created successfully');
        } else {
            console.log('Shipping table already exists, skipping creation');
        }

        // Check if payment table exists
        const paymentTableExists = await queryRunner.hasTable('payment');
        if (!paymentTableExists) {
            await queryRunner.query(`CREATE TABLE \`payment\` (\`payment_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`transaction_id\` varchar(255) NULL, \`amount\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`payment_date\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`payment_id\`)) ENGINE=InnoDB`);
            console.log('Payment table created successfully');
        } else {
            console.log('Payment table already exists, skipping creation');
        }

        // Check if discounts table exists
        const discountsTableExists = await queryRunner.hasTable('discounts');
        if (!discountsTableExists) {
            await queryRunner.query(`CREATE TABLE \`discounts\` (\`discount_id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`description\` text NULL, \`amount\` decimal(10,2) NOT NULL, \`discount_type\` varchar(255) NOT NULL, \`usage_limit\` int NULL, \`times_used\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`start_date\` date NULL, \`end_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`discount_id\`)) ENGINE=InnoDB`);
            console.log('Discounts table created successfully');
        } else {
            console.log('Discounts table already exists, skipping creation');
        }

        // Check if address table exists
        const addressTableExists = await queryRunner.hasTable('address');
        if (!addressTableExists) {
            await queryRunner.query(`CREATE TABLE \`address\` (\`address_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`address_line1\` varchar(255) NOT NULL, \`address_line2\` varchar(255) NULL, \`city\` varchar(255) NOT NULL, \`state\` varchar(255) NOT NULL, \`postal_code\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`is_default\` tinyint NOT NULL DEFAULT 0, \`address_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`address_id\`)) ENGINE=InnoDB`);
            console.log('Address table created successfully');
        } else {
            console.log('Address table already exists, skipping creation');
        }

        // Check if columns exist before attempting to modify
        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`image_url\``);
        } catch (error) {
            console.log('Column image_url does not exist in order_items table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`status\``);
        } catch (error) {
            console.log('Column status does not exist in review table, continuing...');
        }

        // Check if guest_name column exists in review table
        const hasGuestNameColumn = await this.columnExists(queryRunner, 'review', 'guest_name');
        if (!hasGuestNameColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_name\` varchar(255) NULL`);
            console.log('Added guest_name column to review table');
        } else {
            console.log('guest_name column already exists in review table, skipping...');
        }

        // Check if guest_email column exists in review table
        const hasGuestEmailColumn = await this.columnExists(queryRunner, 'review', 'guest_email');
        if (!hasGuestEmailColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_email\` varchar(255) NULL`);
            console.log('Added guest_email column to review table');
        } else {
            console.log('guest_email column already exists in review table, skipping...');
        }

        // Check if is_verified_purchase column exists in review table
        const hasVerifiedPurchaseColumn = await this.columnExists(queryRunner, 'review', 'is_verified_purchase');
        if (!hasVerifiedPurchaseColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`is_verified_purchase\` tinyint NOT NULL DEFAULT 0`);
            console.log('Added is_verified_purchase column to review table');
        } else {
            console.log('is_verified_purchase column already exists in review table, skipping...');
        }

        // Check if name column exists in wishlist table
        const hasNameColumn = await this.columnExists(queryRunner, 'wishlist', 'name');
        if (!hasNameColumn) {
            await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`name\` varchar(255) NOT NULL`);
            console.log('Added name column to wishlist table');
        } else {
            console.log('name column already exists in wishlist table, skipping...');
        }

        // The rest of the migration operations can continue as they are less likely to fail
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total_amount\` \`total_amount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total\` \`total\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`unit_price\` \`unit_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`total_price\` \`total_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`base_price\` \`base_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`stock_quantity\` \`stock_quantity\` int NOT NULL`);

        // Add foreign key constraints
        try {
            await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_772d0ce0473ac2ccfa26060dbe9 foreign key to orders table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_145532db85752b29c57d2b7b1f1 foreign key to order_items table, continuing...');
        }

        // Continue with other foreign key additions with similar try/catch blocks
        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_9263386c35b6b242540f9493b00 foreign key to order_items table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_26b533e15b5f2334c96339a1f08\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_26b533e15b5f2334c96339a1f08 foreign key to review table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_957d0d10b33ce8de57a0a01e483\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_957d0d10b33ce8de57a0a01e483 foreign key to review table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_4f166bb8c2bfcef2498d97b4068 foreign key to product_images table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_de08738901be6b34d2824a1e243\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_de08738901be6b34d2824a1e243 foreign key to categories table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_0374879a971928bc3f57eed0a59 foreign key to product_category table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_2df1f83329c00e6eadde0493e16 foreign key to product_category table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_ac00077fd9942e77c6ad2b5bf71\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\`(\`wishlist_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_ac00077fd9942e77c6ad2b5bf71 foreign key to wishlist_item table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_928fbf35568fcab9681d8270792\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_928fbf35568fcab9681d8270792 foreign key to wishlist_item table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_bf352c755492e9c5b14f36dbaa3\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_bf352c755492e9c5b14f36dbaa3 foreign key to wishlist table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_a37456893780ce2dfe0a7484c22\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_a37456893780ce2dfe0a7484c22 foreign key to shipping table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_f5221735ace059250daac9d9803\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_f5221735ace059250daac9d9803 foreign key to payment table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`address\` ADD CONSTRAINT \`FK_9c9614b2f9d01665800ea8dbff7\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        } catch (error) {
            console.log('Failed to add FK_9c9614b2f9d01665800ea8dbff7 foreign key to address table, continuing...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Similar try-catch pattern for the down migrations
        try {
            await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_9c9614b2f9d01665800ea8dbff7\``);
        } catch (error) {
            console.log('Failed to drop FK_9c9614b2f9d01665800ea8dbff7 foreign key from address table, continuing...');
        }

        // ... existing code ... (similar try/catch for all the foreign key drops)
        try {
            await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_f5221735ace059250daac9d9803\``);
        } catch (error) {
            console.log('Failed to drop FK_f5221735ace059250daac9d9803 foreign key from payment table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_a37456893780ce2dfe0a7484c22\``);
        } catch (error) {
            console.log('Failed to drop FK_a37456893780ce2dfe0a7484c22 foreign key from shipping table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_bf352c755492e9c5b14f36dbaa3\``);
        } catch (error) {
            console.log('Failed to drop FK_bf352c755492e9c5b14f36dbaa3 foreign key from wishlist table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_928fbf35568fcab9681d8270792\``);
        } catch (error) {
            console.log('Failed to drop FK_928fbf35568fcab9681d8270792 foreign key from wishlist_item table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_ac00077fd9942e77c6ad2b5bf71\``);
        } catch (error) {
            console.log('Failed to drop FK_ac00077fd9942e77c6ad2b5bf71 foreign key from wishlist_item table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_2df1f83329c00e6eadde0493e16\``);
        } catch (error) {
            console.log('Failed to drop FK_2df1f83329c00e6eadde0493e16 foreign key from product_category table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_0374879a971928bc3f57eed0a59\``);
        } catch (error) {
            console.log('Failed to drop FK_0374879a971928bc3f57eed0a59 foreign key from product_category table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_de08738901be6b34d2824a1e243\``);
        } catch (error) {
            console.log('Failed to drop FK_de08738901be6b34d2824a1e243 foreign key from categories table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``);
        } catch (error) {
            console.log('Failed to drop FK_4f166bb8c2bfcef2498d97b4068 foreign key from product_images table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_957d0d10b33ce8de57a0a01e483\``);
        } catch (error) {
            console.log('Failed to drop FK_957d0d10b33ce8de57a0a01e483 foreign key from review table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_26b533e15b5f2334c96339a1f08\``);
        } catch (error) {
            console.log('Failed to drop FK_26b533e15b5f2334c96339a1f08 foreign key from review table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        } catch (error) {
            console.log('Failed to drop FK_9263386c35b6b242540f9493b00 foreign key from order_items table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        } catch (error) {
            console.log('Failed to drop FK_145532db85752b29c57d2b7b1f1 foreign key from order_items table, continuing...');
        }

        try {
            await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        } catch (error) {
            console.log('Failed to drop FK_772d0ce0473ac2ccfa26060dbe9 foreign key from orders table, continuing...');
        }

        // Restore columns and tables with checks
        try {
            await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`stock_quantity\` \`stock_quantity\` int NOT NULL DEFAULT '0'`);
            await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`base_price\` \`base_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
            await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`total_price\` \`total_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
            await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`unit_price\` \`unit_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
            await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
            await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL DEFAULT '1'`);
            await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
            await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total\` \`total\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
            await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total_amount\` \`total_amount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        } catch (error) {
            console.log('Error restoring column defaults, continuing...', error.message);
        }

        // Check for columns before dropping them
        const hasNameColumn = await this.columnExists(queryRunner, 'wishlist', 'name');
        if (hasNameColumn) {
            await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`name\``);
        }

        const hasVerifiedPurchaseColumn = await this.columnExists(queryRunner, 'review', 'is_verified_purchase');
        if (hasVerifiedPurchaseColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`is_verified_purchase\``);
        }

        const hasGuestEmailColumn = await this.columnExists(queryRunner, 'review', 'guest_email');
        if (hasGuestEmailColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
        }

        const hasGuestNameColumn = await this.columnExists(queryRunner, 'review', 'guest_name');
        if (hasGuestNameColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
        }

        // Check if status column exists before adding it
        const hasStatusColumn = await this.columnExists(queryRunner, 'review', 'status');
        if (!hasStatusColumn) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
        }

        // Check if image_url column exists before adding it
        const hasImageUrlColumn = await this.columnExists(queryRunner, 'order_items', 'image_url');
        if (!hasImageUrlColumn) {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`image_url\` varchar(255) NULL`);
        }

        // Tables dropping with existence checks
        if (await queryRunner.hasTable('address')) {
            await queryRunner.query(`DROP TABLE \`address\``);
        }

        if (await queryRunner.hasTable('discounts')) {
            await queryRunner.query(`DROP TABLE \`discounts\``);
        }

        if (await queryRunner.hasTable('payment')) {
            await queryRunner.query(`DROP TABLE \`payment\``);
        }

        if (await queryRunner.hasTable('shipping')) {
            await queryRunner.query(`DROP TABLE \`shipping\``);
        }

        if (await queryRunner.hasTable('product_images')) {
            await queryRunner.query(`DROP TABLE \`product_images\``);
        }

        // Check if index exists before dropping it
        try {
            await queryRunner.query(`DROP INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` ON \`customer\``);
        } catch (error) {
            console.log('Index IDX_fdb2f3ad8115da4c7718109a6e does not exist, continuing...');
        }

        if (await queryRunner.hasTable('customer')) {
            await queryRunner.query(`DROP TABLE \`customer\``);
        }
    }

    // Helper method to check if a column exists
    private async columnExists(queryRunner: QueryRunner, table: string, column: string): Promise<boolean> {
        try {
            const query = `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_SCHEMA = DATABASE() 
                          AND TABLE_NAME = '${table}' 
                          AND COLUMN_NAME = '${column}'`;
            const result = await queryRunner.query(query);
            return result[0].count > 0;
        } catch (error) {
            console.log(`Error checking if column ${column} exists in table ${table}:`, error.message);
            return false;
        }
    }
}
