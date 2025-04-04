import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOrderCustomerFK1743727920641 implements MigrationInterface {
    name = 'CreateOrderCustomerFK1743727920641'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Log start of migration
        console.log('Starting migration to create orders customer foreign key...');

        try {
            // Check if the FK_orders_customer foreign key exists and drop it if it does
            const checkFK = await queryRunner.query(
                `SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
                AND TABLE_NAME = 'orders' 
                AND CONSTRAINT_NAME = 'FK_orders_customer'`
            );

            if (checkFK.length > 0) {
                console.log('Found existing FK_orders_customer, dropping it first...');
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
            }

            // Check if the FK_772d0ce0473ac2ccfa26060dbe9 foreign key exists and drop it if it does
            const checkAutoFK = await queryRunner.query(
                `SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
                AND TABLE_NAME = 'orders' 
                AND CONSTRAINT_NAME = 'FK_772d0ce0473ac2ccfa26060dbe9'`
            );

            if (checkAutoFK.length > 0) {
                console.log('Found existing FK_772d0ce0473ac2ccfa26060dbe9, dropping it first...');
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
            }

            // First modify the customer_id column to allow NULL values
            console.log('Modifying customer_id column to allow NULL values...');
            await queryRunner.query(`ALTER TABLE \`orders\` MODIFY \`customer_id\` int NULL`);

            // Create the proper foreign key constraint
            console.log('Creating proper foreign key constraint between orders and customers...');
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_customer\` 
                FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) 
                ON DELETE SET NULL ON UPDATE NO ACTION`
            );

            console.log('Foreign key constraint created successfully.');
        } catch (error) {
            console.error('Error creating foreign key constraint:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the FK_orders_customer foreign key exists and drop it
            console.log('Reverting foreign key constraint...');
            const checkFK = await queryRunner.query(
                `SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
                WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' 
                AND TABLE_NAME = 'orders' 
                AND CONSTRAINT_NAME = 'FK_orders_customer'`
            );

            if (checkFK.length > 0) {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
                console.log('Foreign key constraint dropped successfully.');
            } else {
                console.log('Foreign key constraint not found, nothing to revert.');
            }

            // Set the customer_id column back to NOT NULL if needed
            await queryRunner.query(`ALTER TABLE \`orders\` MODIFY \`customer_id\` int NOT NULL`);
            console.log('Modified customer_id column back to NOT NULL.');
        } catch (error) {
            console.error('Error reverting foreign key constraint:', error);
            throw error;
        }
    }
}
