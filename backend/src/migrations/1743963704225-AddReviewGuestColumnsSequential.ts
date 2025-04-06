import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReviewGuestColumnsSequential1743963704225 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the review table exists
        const tableExists = await queryRunner.hasTable('review');
        if (!tableExists) {
            console.log('Table "review" does not exist, skipping migration');
            return;
        }

        // 1. Run a direct query to see what columns are in the table
        const columns = await queryRunner.query(`DESCRIBE \`review\``);
        console.log('Current columns in review table:', columns.map((col: any) => col.Field));

        // 2. Check if guest_name column exists
        const guestNameExists = columns.some((col: any) => col.Field === 'guest_name');

        // 3. Add guest_name column if it doesn't exist
        if (!guestNameExists) {
            try {
                await queryRunner.query(`ALTER TABLE \`review\` ADD COLUMN \`guest_name\` VARCHAR(255) NULL`);
                console.log('Successfully added guest_name column to review table');
            } catch (error) {
                console.error('Error adding guest_name column:', error);
            }
        } else {
            console.log('guest_name column already exists');
        }

        // 4. Now wait and verify the column was added
        await new Promise(resolve => setTimeout(resolve, 500));

        // 5. Check if guest_email column exists
        const updatedColumns = await queryRunner.query(`DESCRIBE \`review\``);
        const guestEmailExists = updatedColumns.some((col: any) => col.Field === 'guest_email');

        // 6. Add guest_email column if it doesn't exist
        if (!guestEmailExists) {
            try {
                await queryRunner.query(`ALTER TABLE \`review\` ADD COLUMN \`guest_email\` VARCHAR(255) NULL`);
                console.log('Successfully added guest_email column to review table');
            } catch (error) {
                console.error('Error adding guest_email column:', error);
            }
        } else {
            console.log('guest_email column already exists');
        }

        // 7. Final verification
        const finalColumns = await queryRunner.query(`DESCRIBE \`review\``);
        console.log('Columns after migration:', finalColumns.map((col: any) => col.Field));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // First check if the review table exists
        const tableExists = await queryRunner.hasTable('review');
        if (!tableExists) {
            console.log('Table "review" does not exist, skipping rollback');
            return;
        }

        // Check if the columns exist before trying to drop them
        const columns = await queryRunner.query(`DESCRIBE \`review\``);

        // Drop guest_email first (if it exists)
        const guestEmailExists = columns.some((col: any) => col.Field === 'guest_email');
        if (guestEmailExists) {
            try {
                await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
                console.log('Successfully dropped guest_email column');
            } catch (error) {
                console.error('Error dropping guest_email column:', error);
            }
        }

        // Wait a moment before proceeding
        await new Promise(resolve => setTimeout(resolve, 500));

        // Then drop guest_name (if it exists)
        const updatedColumns = await queryRunner.query(`DESCRIBE \`review\``);
        const guestNameExists = updatedColumns.some((col: any) => col.Field === 'guest_name');
        if (guestNameExists) {
            try {
                await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
                console.log('Successfully dropped guest_name column');
            } catch (error) {
                console.error('Error dropping guest_name column:', error);
            }
        }
    }

}
