import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewGuestNames1743829809614 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if guest_name column exists
        const hasGuestName = await queryRunner.hasColumn('review', 'guest_name');
        if (!hasGuestName) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_name\` varchar(255) NULL`);
        }

        // Check if guest_email column exists
        const hasGuestEmail = await queryRunner.hasColumn('review', 'guest_email');
        if (!hasGuestEmail) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_email\` varchar(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert adding guest_email column
        const hasGuestEmail = await queryRunner.hasColumn('review', 'guest_email');
        if (hasGuestEmail) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
        }

        // Revert adding guest_name column
        const hasGuestName = await queryRunner.hasColumn('review', 'guest_name');
        if (hasGuestName) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
        }
    }

}
