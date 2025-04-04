import { MigrationInterface, QueryRunner } from "typeorm";
import * as fs from 'fs';
import * as path from 'path';

export class AddUploadsDirCheck1743744927554 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const productsDir = path.join(uploadsDir, 'products');

        if (!fs.existsSync(uploadsDir)) {
            console.log('Creating uploads directory');
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        if (!fs.existsSync(productsDir)) {
            console.log('Creating uploads/products directory');
            fs.mkdirSync(productsDir, { recursive: true });
        } else {
            console.log('Uploads/products directory already exists');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // We don't want to remove the uploads directory on migration reversion
        // This would delete user-uploaded files
        console.log('Down migration for directory check - no action needed');
    }
} 