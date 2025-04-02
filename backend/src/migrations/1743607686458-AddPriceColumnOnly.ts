import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceColumnOnly1743607686458 implements MigrationInterface {
    name = 'AddPriceColumnOnly1743607686458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if price column exists
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
        const tableColumns = await queryRunner.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = 'jewelry_shop' AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'price'`
        );

        if (tableColumns.length > 0) {
            await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`price\``);
            console.log('Dropped price column from order_items table');
        } else {
            console.log('Price column does not exist in order_items table');
        }
    }
}
