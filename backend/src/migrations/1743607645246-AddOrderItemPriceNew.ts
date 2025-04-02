import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderItemPriceNew1743607645246 implements MigrationInterface {
    name = 'AddOrderItemPriceNew1743607645246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderDetailsText\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderNumber\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentMethod\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentStatus\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`image_url\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`customization_details\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`total_price\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`unit_price\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`billing_address_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`customer_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_address_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total_amount\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`customer_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total_amount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_address_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`billing_address_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`unit_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`total_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`customization_details\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentMethod\` enum ('vietqr', 'momo', 'cod') NOT NULL DEFAULT 'cod'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentStatus\` enum ('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderDetailsText\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`product_id\` \`product_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Check if the 'price' column already exists in the order_items table
        const tableColumns = await queryRunner.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = 'jewelry_shop' AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'price'`
        );

        // Only add the price column if it doesn't exist
        if (tableColumns.length === 0) {
            await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`price\` decimal(10,2) NOT NULL DEFAULT 0.00`);
            console.log('Added price column to order_items table');
        } else {
            console.log('Price column already exists in order_items table');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_a922b820eeef29ac1c6800e826a\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`product_id\` \`product_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updatedAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`createdAt\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`user_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderDetailsText\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentStatus\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`paymentMethod\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`orderNumber\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`image_url\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`customization_details\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`total_price\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`unit_price\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`deleted_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`billing_address_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`shipping_address_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total_amount\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`customer_id\``);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`total_amount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`shipping_address_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`customer_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`billing_address_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`unit_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`total_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`deleted_at\` datetime(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`customization_details\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`image_url\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentStatus\` enum ('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`paymentMethod\` enum ('vietqr', 'momo', 'cod') NOT NULL DEFAULT 'cod'`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderNumber\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`orderDetailsText\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_a922b820eeef29ac1c6800e826a\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

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
    }

}
