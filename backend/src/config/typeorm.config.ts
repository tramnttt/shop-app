import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { migrations } from '../migrations';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '17932486',
    database: process.env.DB_DATABASE || 'jewelry_shop',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: migrations,
    synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 