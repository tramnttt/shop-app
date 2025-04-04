import { AddOrderFields1712165975193 } from './1712165975193-AddOrderFields';
import { AddOrderItemPriceNew1743607645246 } from './1743607645246-AddOrderItemPriceNew';
import { AddPriceColumnOnly1743607686458 } from './1743607686458-AddPriceColumnOnly';
import { AddMissingColumnsAll1743707580500 } from './1743707580500-AddMissingColumnsAll';
import { FixForeignKeyDrop1743727715585 } from './1743727715585-FixForeignKeyDrop';
import { SafeDropForeignKeys1743727762498 } from './1743727762498-SafeDropForeignKeys';
import { FixOrdersCustomerFK1743727817704 } from './1743727817704-FixOrdersCustomerFK';
import { CreateOrderCustomerFK1743727920641 } from './1743727920641-CreateOrderCustomerFK';
import { FixMissingColumns1743730136591 } from './1743730136591-FixMissingColumns';
import { InitialDbSetup1743744927552 } from './1743744927552-InitialDbSetup';
import { AddProductImageTable1743744927553 } from './1743744927553-AddProductImageTable';
import { AddUploadsDirCheck1743744927554 } from './1743744927554-AddUploadsDirCheck';
import { AddProductImageTable1743784309333 } from './1743784309333-AddProductImageTable';

// Export migrations in the order they should be executed
export const migrations = [
    AddOrderFields1712165975193,
    AddOrderItemPriceNew1743607645246,
    AddPriceColumnOnly1743607686458,
    AddMissingColumnsAll1743707580500,
    FixForeignKeyDrop1743727715585,
    SafeDropForeignKeys1743727762498,
    FixOrdersCustomerFK1743727817704,
    CreateOrderCustomerFK1743727920641,
    FixMissingColumns1743730136591,
    InitialDbSetup1743744927552,
    AddProductImageTable1743744927553,
    AddUploadsDirCheck1743744927554,
    AddProductImageTable1743784309333
];
