import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewGuestFields1743829623936 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if guest_name column exists in Review table
        const guestNameExists = await queryRunner.hasColumn('review', 'guest_name');
        if (!guestNameExists) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_name\` varchar(255) NULL`);
        }

        // Check if guest_email column exists in Review table
        const guestEmailExists = await queryRunner.hasColumn('review', 'guest_email');
        if (!guestEmailExists) {
            await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_email\` varchar(255) NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert adding guest_email column
        const guestEmailExists = await queryRunner.hasColumn('review', 'guest_email');
        if (guestEmailExists) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
        }

        // Revert adding guest_name column
        const guestNameExists = await queryRunner.hasColumn('review', 'guest_name');
        if (guestNameExists) {
            await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
        }
    }

}
