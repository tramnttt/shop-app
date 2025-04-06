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
import { AddReviewGuestFields1743829623936 } from './1743829623936-AddReviewGuestFields';
import { AddReviewGuestNames1743829809614 } from './1743829809614-AddReviewGuestNames';
import { AddReviewGuestColumns1743836151224 } from './1743836151224-AddReviewGuestColumns';
import { AddReviewGuestColumnsSequential1743963704225 } from './1743963704225-AddReviewGuestColumnsSequential';
import { AddParentCategoryId1743963965181 } from './1743963965181-AddParentCategoryId';

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
    AddProductImageTable1743784309333,
    AddReviewGuestFields1743829623936,
    AddReviewGuestNames1743829809614,
    AddReviewGuestColumns1743836151224,
    AddReviewGuestColumnsSequential1743963704225,
    AddParentCategoryId1743963965181
];
