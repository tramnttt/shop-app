import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderItemPriceNew1743607645246 implements MigrationInterface {
    name = 'AddOrderItemPriceNew1743607645246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Skip foreign key checks to avoid constraint issues
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS=0`);

        try {
            // Try to drop foreign keys if they exist
            try {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
            } catch (error) {
                console.log('Foreign key FK_a922b820eeef29ac1c6800e826a might not exist, skipping');
            }

            try {
                await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
            } catch (error) {
                console.log('Foreign key FK_145532db85752b29c57d2b7b1f1 might not exist, skipping');
            }

            try {
                await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
            } catch (error) {
                console.log('Foreign key FK_9263386c35b6b242540f9493b00 might not exist, skipping');
            }

            try {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
            } catch (error) {
                console.log('Foreign key FK_772d0ce0473ac2ccfa26060dbe9 might not exist, skipping');
            }

            // Check which columns exist before trying to modify them
            const orderColumns = await queryRunner.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'jewelry_shop' AND TABLE_NAME = 'orders'`
            );
            const orderItemsColumns = await queryRunner.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'jewelry_shop' AND TABLE_NAME = 'order_items'`
            );

            const orderColumnsSet = new Set(orderColumns.map(col => col.COLUMN_NAME.toLowerCase()));
            const orderItemsColumnsSet = new Set(orderItemsColumns.map(col => col.COLUMN_NAME.toLowerCase()));

            // Safely drop columns from orders table
            if (orderColumnsSet.has('createdat')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
            if (orderColumnsSet.has('orderdetailstext')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderDetailsText\``);
            if (orderColumnsSet.has('ordernumber')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderNumber\``);
            if (orderColumnsSet.has('paymentmethod')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentMethod\``);
            if (orderColumnsSet.has('paymentstatus')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentStatus\``);
            if (orderColumnsSet.has('updatedat')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
            if (orderColumnsSet.has('user_id')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`user_id\``);

            // Safely drop columns from order_items table
            if (orderItemsColumnsSet.has('image_url')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`image_url\``);
            if (orderItemsColumnsSet.has('created_at')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`created_at\``);
            if (orderItemsColumnsSet.has('customization_details')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`customization_details\``);
            if (orderItemsColumnsSet.has('deleted_at')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`deleted_at\``);
            if (orderItemsColumnsSet.has('total_price')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`total_price\``);
            if (orderItemsColumnsSet.has('unit_price')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`unit_price\``);
            if (orderItemsColumnsSet.has('updated_at')) await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`updated_at\``);

            // Check for foreign keys and drop them if they exist
            try {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
                console.log('Dropped FK_orders_customer foreign key');
            } catch (error) {
                console.log('Foreign key FK_orders_customer might not exist, skipping');
            }

            // More order table columns
            if (orderColumnsSet.has('billing_address_id')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`billing_address_id\``);
            if (orderColumnsSet.has('created_at')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
            if (orderColumnsSet.has('customer_id')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`customer_id\``);
            if (orderColumnsSet.has('deleted_at')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deleted_at\``);
            if (orderColumnsSet.has('shipping_address_id')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_address_id\``);
            if (orderColumnsSet.has('total_amount')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total_amount\``);
            if (orderColumnsSet.has('updated_at')) await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);

            // Add needed columns to orders table
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`customer_id\` int NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total_amount\` decimal(10,2) NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_address_id\` int NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`billing_address_id\` int NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deleted_at\` datetime(6) NULL`);

            // Add needed columns to order_items table
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`unit_price\` decimal(10,2) NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`total_price\` decimal(10,2) NOT NULL`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`customization_details\` text NULL`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`deleted_at\` datetime(6) NULL`);
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`image_url\` varchar(255) NULL`);

            // Add additional order fields
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderNumber\` varchar(255) NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentMethod\` enum ('vietqr', 'momo', 'cod') NOT NULL DEFAULT 'cod'`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentStatus\` enum ('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending'`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderDetailsText\` text NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`user_id\` int NULL`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);

            // Check if status column exists
            if (orderColumnsSet.has('status')) {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
            }
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(255) NOT NULL`);

            // Modify product_id to allow NULL
            await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`product_id\` \`product_id\` int NULL`);

            // Update status column to use enum
            await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
            await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'`);

            // Try to add foreign keys with error handling
            try {
                await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
            } catch (error) {
                console.log('Could not add FK_772d0ce0473ac2ccfa26060dbe9 (customer_id), skipping:', error.message);
            }

            try {
                await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
            } catch (error) {
                console.log('Could not add FK_145532db85752b29c57d2b7b1f1 (order_id), skipping:', error.message);
            }

            try {
                await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
            } catch (error) {
                console.log('Could not add FK_9263386c35b6b242540f9493b00 (product_id), skipping:', error.message);
            }

            try {
                await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
            } catch (error) {
                console.log('Could not add FK_a922b820eeef29ac1c6800e826a (user_id), skipping:', error.message);
            }

            // Check if the 'price' column already exists in the order_items table
            const priceColumnExists = orderItemsColumnsSet.has('price');

            // Only add the price column if it doesn't exist
            if (!priceColumnExists) {
                await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`price\` decimal(10,2) NOT NULL DEFAULT 0.00`);
                console.log('Added price column to order_items table');
            } else {
                console.log('Price column already exists in order_items table');
            }
        } finally {
            // Re-enable foreign key checks
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS=1`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This method won't be used but needs to be defined
        // Skip foreign key checks to avoid constraint issues
        await queryRunner.query(`SET FOREIGN_KEY_CHECKS=0`);

        try {
            // Check if the 'price' column exists before attempting to drop it
            const tableColumns = await queryRunner.query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = 'jewelry_shop' AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'price'`
            );

            // Only drop the price column if it exists
            if (tableColumns.length > 0) {
                await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`price\``);
                console.log('Dropped price column from order_items table');
            } else {
                console.log('Price column does not exist in order_items table');
            }
        } finally {
            // Re-enable foreign key checks
            await queryRunner.query(`SET FOREIGN_KEY_CHECKS=1`);
        }
    }
}