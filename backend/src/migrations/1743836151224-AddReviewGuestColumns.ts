import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewGuestColumns1743836151224 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Use direct SQL queries to add the columns to the review table
        try {
            // Check if the column already exists
            const tableColumns = await queryRunner.query(`SHOW COLUMNS FROM \`review\``);
            const guestNameExists = tableColumns.some(col => col.Field === 'guest_name');
            const guestEmailExists = tableColumns.some(col => col.Field === 'guest_email');

            // Add guest_name column if it doesn't exist
            if (!guestNameExists) {
                await queryRunner.query(`ALTER TABLE \`review\` ADD COLUMN \`guest_name\` VARCHAR(255) NULL`);
                console.log('Successfully added guest_name column to review table');
            } else {
                console.log('guest_name column already exists in review table');
            }

            // Add guest_email column if it doesn't exist
            if (!guestEmailExists) {
                await queryRunner.query(`ALTER TABLE \`review\` ADD COLUMN \`guest_email\` VARCHAR(255) NULL`);
                console.log('Successfully added guest_email column to review table');
            } else {
                console.log('guest_email column already exists in review table');
            }

            // Verify columns were added
            console.log('Review table columns after migration:');
            const updatedColumns = await queryRunner.query(`SHOW COLUMNS FROM \`review\``);
            console.log(updatedColumns.map(col => col.Field));
        } catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            // Check if the columns exist before dropping
            const tableColumns = await queryRunner.query(`SHOW COLUMNS FROM \`review\``);
            const guestNameExists = tableColumns.some(col => col.Field === 'guest_name');
            const guestEmailExists = tableColumns.some(col => col.Field === 'guest_email');

            // Drop the columns if they exist
            if (guestEmailExists) {
                await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
                console.log('Successfully dropped guest_email column from review table');
            }

            if (guestNameExists) {
                await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
                console.log('Successfully dropped guest_name column from review table');
            }
        } catch (error) {
            console.error('Error during migration rollback:', error);
            throw error;
        }
    }
}
