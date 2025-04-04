import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImageTable1743744927553 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the table already exists
        const tableExists = await queryRunner.hasTable('product_images');
        if (tableExists) {
            console.log('Table product_images already exists, skipping creation');
            return;
        }

        // Create product_images table
        await queryRunner.query(`
            CREATE TABLE product_images (
                image_id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                alt_text VARCHAR(255),
                is_primary BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP NULL,
                CONSTRAINT fk_product_images_product_id FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        console.log('Created product_images table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if the table exists before attempting to drop
        const tableExists = await queryRunner.hasTable('product_images');
        if (!tableExists) {
            console.log('Table product_images does not exist, skipping drop');
            return;
        }

        // Drop the foreign key constraint first
        await queryRunner.query(`
            ALTER TABLE product_images DROP FOREIGN KEY fk_product_images_product_id;
        `);

        // Drop the table
        await queryRunner.query(`
            DROP TABLE product_images;
        `);

        console.log('Dropped product_images table');
    }
} 