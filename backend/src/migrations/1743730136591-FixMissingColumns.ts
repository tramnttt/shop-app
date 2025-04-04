import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMissingColumns1743730136591 implements MigrationInterface {
    name = 'FixMissingColumns1743730136591'

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('Starting migration to fix missing columns...');

        try {
            // Check if password column doesn't exist in customers table and add it
            const checkCustomersPassword = await queryRunner.query(
                `SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '${queryRunner.connection.options.database}' 
                AND TABLE_NAME = 'customers' 
                AND COLUMN_NAME = 'password'`
            );

            if (checkCustomersPassword.length === 0) {
                console.log('Adding password column to customers table...');
                await queryRunner.query(`ALTER TABLE \`customers\` ADD \`password\` varchar(255) NOT NULL DEFAULT ''`);
                console.log('Password column added successfully.');
            } else {
                console.log('Password column already exists in customers table.');
            }

            // Fix alt_text column type in product_image table
            const checkAltText = await queryRunner.query(
                `SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '${queryRunner.connection.options.database}' 
                AND TABLE_NAME = 'product_image' 
                AND COLUMN_NAME = 'alt_text'`
            );

            if (checkAltText.length > 0) {
                // Check if the column type is already varchar or similar text type
                const columnType = checkAltText[0].DATA_TYPE;
                if (columnType === 'int' || columnType === 'tinyint' || columnType === 'bigint') {
                    console.log('Converting alt_text column in product_image table to varchar...');
                    await queryRunner.query(`ALTER TABLE \`product_image\` MODIFY \`alt_text\` varchar(255) NULL`);
                    console.log('alt_text column type updated successfully.');
                } else {
                    console.log('alt_text column is already of text type.');
                }
            } else {
                console.log('Adding alt_text column to product_image table...');
                await queryRunner.query(`ALTER TABLE \`product_image\` ADD \`alt_text\` varchar(255) NULL`);
                console.log('alt_text column added successfully.');
            }

            console.log('Migration completed successfully.');
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // We don't want to remove the password column, just make it nullable
            console.log('Reverting changes...');

            // Make password column nullable so it doesn't break existing references
            await queryRunner.query(`ALTER TABLE \`customers\` MODIFY \`password\` varchar(255) NULL`);
            console.log('Made password column nullable.');

            // We don't change back alt_text since it's needed for proper functionality
            console.log('Keeping alt_text as varchar for compatibility.');

            console.log('Migration reverted successfully.');
        } catch (error) {
            console.error('Error reverting migration:', error);
            throw error;
        }
    }
}
