import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOrdersCustomerFK1743727817704 implements MigrationInterface {
    name = 'FixOrdersCustomerFK1743727817704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First check if the FK_orders_customer exists
        const foreignKeys = await queryRunner.query(
            `SELECT * FROM information_schema.table_constraints 
            WHERE constraint_schema = '${queryRunner.connection.options.database}' 
            AND table_name = 'orders' 
            AND constraint_name = 'FK_orders_customer' 
            AND constraint_type = 'FOREIGN KEY'`
        );

        // If the FK exists, drop it
        if (foreignKeys.length > 0) {
            try {
                await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
                console.log('FK_orders_customer foreign key dropped successfully');
            } catch (error) {
                console.log('Error dropping FK_orders_customer:', error.message);
            }
        } else {
            console.log('FK_orders_customer foreign key does not exist, no need to drop it');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No need for a down migration as we don't want to re-add a potentially broken constraint
        console.log('No need to restore potentially problematic foreign key constraint');
    }
}
