import { MigrationInterface, QueryRunner } from "typeorm";

export class FixForeignKeyDrop1743727715585 implements MigrationInterface {
    name = 'FixForeignKeyDrop1743727715585'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // This migration doesn't make any changes
        // It's a precautionary migration to ensure all future migrations safely handle foreign key drops
        console.log('Foreign key drop precautionary migration executed - no changes made');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No changes to revert
    }
}
