import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderFields1712165975193 implements MigrationInterface {
    name = 'AddOrderFields1712165975193';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the 'total' column already exists in the 'orders' table
        const orderTotalExists = await queryRunner.hasColumn('orders', 'total');
        if (!orderTotalExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD \`total\` decimal(10,2) NOT NULL`,
            );
        }

        // Check if the 'name' column already exists in the 'order_items' table
        const orderItemNameExists = await queryRunner.hasColumn('order_items', 'name');
        if (!orderItemNameExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` ADD \`name\` varchar(255) NOT NULL`,
            );
        }

        // Convert order_id to id in orders table if needed
        const orderIdColumnExists = await queryRunner.hasColumn('orders', 'order_id');
        const idColumnExists = await queryRunner.hasColumn('orders', 'id');

        if (orderIdColumnExists && !idColumnExists) {
            await queryRunner.query(`
        ALTER TABLE \`orders\` 
        CHANGE COLUMN \`order_id\` \`id\` int NOT NULL AUTO_INCREMENT
      `);
        }

        // Convert order_item_id to id in order_items table if needed
        const orderItemIdColumnExists = await queryRunner.hasColumn('order_items', 'order_item_id');
        const orderItemIdAsIdExists = await queryRunner.hasColumn('order_items', 'id');

        if (orderItemIdColumnExists && !orderItemIdAsIdExists) {
            await queryRunner.query(`
        ALTER TABLE \`order_items\` 
        CHANGE COLUMN \`order_item_id\` \`id\` int NOT NULL AUTO_INCREMENT
      `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the 'total' column from the 'orders' table
        const orderTotalExists = await queryRunner.hasColumn('orders', 'total');
        if (orderTotalExists) {
            await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`total\``);
        }

        // Remove the 'name' column from the 'order_items' table
        const orderItemNameExists = await queryRunner.hasColumn('order_items', 'name');
        if (orderItemNameExists) {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`name\``);
        }

        // Convert id back to order_id in orders table if needed
        const idColumnExists = await queryRunner.hasColumn('orders', 'id');
        const orderIdColumnExists = await queryRunner.hasColumn('orders', 'order_id');

        if (idColumnExists && !orderIdColumnExists) {
            await queryRunner.query(`
        ALTER TABLE \`orders\` 
        CHANGE COLUMN \`id\` \`order_id\` int NOT NULL AUTO_INCREMENT
      `);
        }

        // Convert id back to order_item_id in order_items table if needed
        const orderItemIdAsIdExists = await queryRunner.hasColumn('order_items', 'id');
        const orderItemIdColumnExists = await queryRunner.hasColumn('order_items', 'order_item_id');

        if (orderItemIdAsIdExists && !orderItemIdColumnExists) {
            await queryRunner.query(`
        ALTER TABLE \`order_items\` 
        CHANGE COLUMN \`id\` \`order_item_id\` int NOT NULL AUTO_INCREMENT
      `);
        }
    }
} 