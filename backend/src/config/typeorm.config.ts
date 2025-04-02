import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '17932486',
    database: process.env.DB_DATABASE || 'jewelry_shop',
    entities: [
        __dirname + '/../entities/*.entity{.ts,.js}',
        __dirname + '/../users/entities/*.entity{.ts,.js}',
        __dirname + '/../products/entities/*.entity{.ts,.js}',
        __dirname + '/../categories/entities/*.entity{.ts,.js}',
        __dirname + '/../orders/entities/*.entity{.ts,.js}',
        __dirname + '/../payments/entities/*.entity{.ts,.js}',
        __dirname + '/../reviews/entities/*.entity{.ts,.js}',
        __dirname + '/../auth/entities/*.entity{.ts,.js}',
    ],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 