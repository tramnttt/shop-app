import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumnsAll1743707580500 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Customer table columns
        const customerPasswordHashExists = await queryRunner.hasColumn('customers', 'password_hash');
        if (!customerPasswordHashExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` ADD \`password_hash\` varchar(255) NOT NULL`
            );
        }

        const customerPhoneExists = await queryRunner.hasColumn('customers', 'phone');
        if (!customerPhoneExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` ADD \`phone\` varchar(255) NULL`
            );
        }

        const customerLastLoginExists = await queryRunner.hasColumn('customers', 'last_login');
        if (!customerLastLoginExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` ADD \`last_login\` datetime NULL`
            );
        }

        // Category table columns
        const categoryImageUrlExists = await queryRunner.hasColumn('categories', 'image_url');
        if (!categoryImageUrlExists) {
            await queryRunner.query(
                `ALTER TABLE \`categories\` ADD \`image_url\` varchar(255) NULL`
            );
        }

        const categoryParentIdExists = await queryRunner.hasColumn('categories', 'parent_category_id');
        if (!categoryParentIdExists) {
            await queryRunner.query(
                `ALTER TABLE \`categories\` ADD \`parent_category_id\` int NULL`
            );

            // Add foreign key if parent_category_id column was added
            await queryRunner.query(
                `ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_parent_category\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE SET NULL`
            );
        }

        // Product table columns
        const productBasePriceExists = await queryRunner.hasColumn('products', 'base_price');
        if (!productBasePriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`base_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`
            );
        }

        const productSalePriceExists = await queryRunner.hasColumn('products', 'sale_price');
        if (!productSalePriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`sale_price\` decimal(10,2) NULL`
            );
        }

        const productIsFeaturedExists = await queryRunner.hasColumn('products', 'is_featured');
        if (!productIsFeaturedExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`is_featured\` tinyint NOT NULL DEFAULT 0`
            );
        }

        const productMetalTypeExists = await queryRunner.hasColumn('products', 'metal_type');
        if (!productMetalTypeExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`metal_type\` varchar(255) NULL`
            );
        }

        const productGemstoneTypeExists = await queryRunner.hasColumn('products', 'gemstone_type');
        if (!productGemstoneTypeExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`gemstone_type\` varchar(255) NULL`
            );
        }

        const productWeightExists = await queryRunner.hasColumn('products', 'weight');
        if (!productWeightExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`weight\` decimal(10,2) NULL`
            );
        }

        const productDimensionsExists = await queryRunner.hasColumn('products', 'dimensions');
        if (!productDimensionsExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` ADD \`dimensions\` varchar(255) NULL`
            );
        }

        // Order items columns
        const orderItemUnitPriceExists = await queryRunner.hasColumn('order_items', 'unit_price');
        if (!orderItemUnitPriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` ADD \`unit_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`
            );
        }

        const orderItemTotalPriceExists = await queryRunner.hasColumn('order_items', 'total_price');
        if (!orderItemTotalPriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` ADD \`total_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`
            );
        }

        const orderItemNameExists = await queryRunner.hasColumn('order_items', 'name');
        if (!orderItemNameExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` ADD \`name\` varchar(255) NOT NULL DEFAULT ''`
            );
        }

        const orderItemCustomizationDetailsExists = await queryRunner.hasColumn('order_items', 'customization_details');
        if (!orderItemCustomizationDetailsExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` ADD \`customization_details\` text NULL`
            );
        }

        // Order table columns
        const orderTotalAmountExists = await queryRunner.hasColumn('orders', 'total_amount');
        if (!orderTotalAmountExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD \`total_amount\` decimal(10,2) NOT NULL DEFAULT '0.00'`
            );
        }

        const orderTotalExists = await queryRunner.hasColumn('orders', 'total');
        if (!orderTotalExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD \`total\` decimal(10,2) NOT NULL DEFAULT '0.00'`
            );
        }

        const orderShippingAddressIdExists = await queryRunner.hasColumn('orders', 'shipping_address_id');
        if (!orderShippingAddressIdExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD \`shipping_address_id\` int NULL`
            );
        }

        const orderBillingAddressIdExists = await queryRunner.hasColumn('orders', 'billing_address_id');
        if (!orderBillingAddressIdExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` ADD \`billing_address_id\` int NULL`
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns in reverse order of creation

        // Order table columns
        const orderBillingAddressIdExists = await queryRunner.hasColumn('orders', 'billing_address_id');
        if (orderBillingAddressIdExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` DROP COLUMN \`billing_address_id\``
            );
        }

        const orderShippingAddressIdExists = await queryRunner.hasColumn('orders', 'shipping_address_id');
        if (orderShippingAddressIdExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` DROP COLUMN \`shipping_address_id\``
            );
        }

        const orderTotalExists = await queryRunner.hasColumn('orders', 'total');
        if (orderTotalExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` DROP COLUMN \`total\``
            );
        }

        const orderTotalAmountExists = await queryRunner.hasColumn('orders', 'total_amount');
        if (orderTotalAmountExists) {
            await queryRunner.query(
                `ALTER TABLE \`orders\` DROP COLUMN \`total_amount\``
            );
        }

        // Order items columns
        const orderItemCustomizationDetailsExists = await queryRunner.hasColumn('order_items', 'customization_details');
        if (orderItemCustomizationDetailsExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` DROP COLUMN \`customization_details\``
            );
        }

        const orderItemNameExists = await queryRunner.hasColumn('order_items', 'name');
        if (orderItemNameExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` DROP COLUMN \`name\``
            );
        }

        const orderItemTotalPriceExists = await queryRunner.hasColumn('order_items', 'total_price');
        if (orderItemTotalPriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` DROP COLUMN \`total_price\``
            );
        }

        const orderItemUnitPriceExists = await queryRunner.hasColumn('order_items', 'unit_price');
        if (orderItemUnitPriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`order_items\` DROP COLUMN \`unit_price\``
            );
        }

        // Product table columns
        const productDimensionsExists = await queryRunner.hasColumn('products', 'dimensions');
        if (productDimensionsExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`dimensions\``
            );
        }

        const productWeightExists = await queryRunner.hasColumn('products', 'weight');
        if (productWeightExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`weight\``
            );
        }

        const productGemstoneTypeExists = await queryRunner.hasColumn('products', 'gemstone_type');
        if (productGemstoneTypeExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`gemstone_type\``
            );
        }

        const productMetalTypeExists = await queryRunner.hasColumn('products', 'metal_type');
        if (productMetalTypeExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`metal_type\``
            );
        }

        const productIsFeaturedExists = await queryRunner.hasColumn('products', 'is_featured');
        if (productIsFeaturedExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`is_featured\``
            );
        }

        const productSalePriceExists = await queryRunner.hasColumn('products', 'sale_price');
        if (productSalePriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`sale_price\``
            );
        }

        const productBasePriceExists = await queryRunner.hasColumn('products', 'base_price');
        if (productBasePriceExists) {
            await queryRunner.query(
                `ALTER TABLE \`products\` DROP COLUMN \`base_price\``
            );
        }

        // Category table columns
        const categoryParentIdExists = await queryRunner.hasColumn('categories', 'parent_category_id');
        if (categoryParentIdExists) {
            // Drop foreign key first
            try {
                await queryRunner.query(
                    `ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_parent_category\``
                );
            } catch (error) {
                console.log('Foreign key FK_parent_category might not exist:', error);
            }

            await queryRunner.query(
                `ALTER TABLE \`categories\` DROP COLUMN \`parent_category_id\``
            );
        }

        const categoryImageUrlExists = await queryRunner.hasColumn('categories', 'image_url');
        if (categoryImageUrlExists) {
            await queryRunner.query(
                `ALTER TABLE \`categories\` DROP COLUMN \`image_url\``
            );
        }

        // Customer table columns
        const customerLastLoginExists = await queryRunner.hasColumn('customers', 'last_login');
        if (customerLastLoginExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` DROP COLUMN \`last_login\``
            );
        }

        const customerPhoneExists = await queryRunner.hasColumn('customers', 'phone');
        if (customerPhoneExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` DROP COLUMN \`phone\``
            );
        }

        const customerPasswordHashExists = await queryRunner.hasColumn('customers', 'password_hash');
        if (customerPasswordHashExists) {
            await queryRunner.query(
                `ALTER TABLE \`customers\` DROP COLUMN \`password_hash\``
            );
        }
    }
}
