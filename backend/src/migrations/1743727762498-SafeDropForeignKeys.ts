import { MigrationInterface, QueryRunner } from "typeorm";

export class SafeDropForeignKeys1743727762498 implements MigrationInterface {
    name = 'SafeDropForeignKeys1743727762498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration is now replaced by the FixOrdersCustomerFK migration
        console.log('This migration is replaced by FixOrdersCustomerFK which directly handles foreign key issues');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No actions needed
    }
}
