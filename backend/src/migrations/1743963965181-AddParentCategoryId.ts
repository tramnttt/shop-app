import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentCategoryId1743963965181 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if parent_category_id column already exists in categories table
        const hasParentCategoryIdColumn = await this.columnExists(queryRunner, 'categories', 'parent_category_id');

        if (!hasParentCategoryIdColumn) {
            console.log('Adding parent_category_id column to categories table...');
            await queryRunner.query(`ALTER TABLE \`categories\` ADD \`parent_category_id\` int NULL`);

            // Add foreign key constraint if it doesn't exist
            try {
                console.log('Adding foreign key constraint for parent_category_id...');
                await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_parent_category_id\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE SET NULL ON UPDATE CASCADE`);
                console.log('Foreign key constraint added successfully.');
            } catch (error) {
                console.log('Failed to add foreign key constraint:', error.message);
                console.log('The column was added, but the foreign key constraint could not be created.');
            }

            console.log('parent_category_id column added successfully to categories table.');
        } else {
            console.log('parent_category_id column already exists in categories table, skipping...');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if parent_category_id column exists
        const hasParentCategoryIdColumn = await this.columnExists(queryRunner, 'categories', 'parent_category_id');

        if (hasParentCategoryIdColumn) {
            // First try to drop the foreign key if it exists
            try {
                console.log('Removing foreign key constraint for parent_category_id...');
                await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_parent_category_id\``);
                console.log('Foreign key constraint removed successfully.');
            } catch (error) {
                console.log('Foreign key constraint not found or could not be dropped:', error.message);
            }

            // Then drop the column
            console.log('Removing parent_category_id column from categories table...');
            await queryRunner.query(`ALTER TABLE \`categories\` DROP COLUMN \`parent_category_id\``);
            console.log('parent_category_id column removed successfully from categories table.');
        } else {
            console.log('parent_category_id column does not exist in categories table, skipping...');
        }
    }

    // Helper method to check if a column exists
    private async columnExists(queryRunner: QueryRunner, table: string, column: string): Promise<boolean> {
        try {
            const query = `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_SCHEMA = DATABASE() 
                          AND TABLE_NAME = '${table}' 
                          AND COLUMN_NAME = '${column}'`;
            const result = await queryRunner.query(query);
            return result[0].count > 0;
        } catch (error) {
            console.log(`Error checking if column ${column} exists in table ${table}:`, error.message);
            return false;
        }
    }

}
