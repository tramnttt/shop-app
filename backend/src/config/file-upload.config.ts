import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

// Ensure the uploads directory exists
const ensureDirectoryExists = (directory: string) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
};

// Make sure the uploads directory exists
ensureDirectoryExists('./uploads/products');

export const fileUploadConfig = {
    storage: diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads/products');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = uuidv4();
            const extension = extname(file.originalname);
            cb(null, `${uniqueSuffix}${extension}`);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Check if file is an image
        if (!file.mimetype.match(/^image\/(jpeg|png|gif|jpg)$/)) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
}; 