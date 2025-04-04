import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductImageTable1743784309333 implements MigrationInterface {
    name = 'AddProductImageTable1743784309333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_orders_customer\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_order\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_order_items_product\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_review_customer\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_review_product\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_parent_category\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_product_category_category\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_product_category_product\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_wishlist_item_product\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_wishlist_item_wishlist\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_wishlist_customer\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` CHANGE \`id\` \`wishlist_item_id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`CREATE TABLE \`customer\` (\`customer_id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`role\` varchar(255) NOT NULL DEFAULT 'customer', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, \`last_login\` datetime NULL, UNIQUE INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` (\`email\`), PRIMARY KEY (\`customer_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_images\` (\`image_id\` int NOT NULL AUTO_INCREMENT, \`product_id\` int NOT NULL, \`image_url\` varchar(255) NOT NULL, \`alt_text\` varchar(255) NULL, \`is_primary\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`image_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shipping\` (\`shipping_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`carrier\` varchar(255) NOT NULL, \`tracking_number\` varchar(255) NULL, \`shipping_cost\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`estimated_delivery\` datetime NULL, \`actual_delivery\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`shipping_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`payment_id\` int NOT NULL AUTO_INCREMENT, \`order_id\` int NOT NULL, \`payment_method\` varchar(255) NOT NULL, \`transaction_id\` varchar(255) NULL, \`amount\` decimal(10,2) NOT NULL, \`status\` varchar(255) NOT NULL, \`payment_date\` datetime NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`payment_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`discounts\` (\`discount_id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`description\` text NULL, \`amount\` decimal(10,2) NOT NULL, \`discount_type\` varchar(255) NOT NULL, \`usage_limit\` int NULL, \`times_used\` int NOT NULL DEFAULT '0', \`is_active\` tinyint NOT NULL DEFAULT 1, \`start_date\` date NULL, \`end_date\` date NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`discount_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`address\` (\`address_id\` int NOT NULL AUTO_INCREMENT, \`customer_id\` int NOT NULL, \`address_line1\` varchar(255) NOT NULL, \`address_line2\` varchar(255) NULL, \`city\` varchar(255) NOT NULL, \`state\` varchar(255) NOT NULL, \`postal_code\` varchar(255) NOT NULL, \`country\` varchar(255) NOT NULL, \`is_default\` tinyint NOT NULL DEFAULT 0, \`address_type\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`address_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP COLUMN \`image_url\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_name\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`guest_email\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`is_verified_purchase\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD \`name\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total_amount\` \`total_amount\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total\` \`total\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`unit_price\` \`unit_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`total_price\` \`total_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`base_price\` \`base_price\` decimal(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`stock_quantity\` \`stock_quantity\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_772d0ce0473ac2ccfa26060dbe9\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_145532db85752b29c57d2b7b1f1\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_9263386c35b6b242540f9493b00\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_26b533e15b5f2334c96339a1f08\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_957d0d10b33ce8de57a0a01e483\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_de08738901be6b34d2824a1e243\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_ac00077fd9942e77c6ad2b5bf71\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\`(\`wishlist_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_928fbf35568fcab9681d8270792\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_bf352c755492e9c5b14f36dbaa3\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shipping\` ADD CONSTRAINT \`FK_a37456893780ce2dfe0a7484c22\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_f5221735ace059250daac9d9803\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`address\` ADD CONSTRAINT \`FK_9c9614b2f9d01665800ea8dbff7\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customer\`(\`customer_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`address\` DROP FOREIGN KEY \`FK_9c9614b2f9d01665800ea8dbff7\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_f5221735ace059250daac9d9803\``);
        await queryRunner.query(`ALTER TABLE \`shipping\` DROP FOREIGN KEY \`FK_a37456893780ce2dfe0a7484c22\``);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP FOREIGN KEY \`FK_bf352c755492e9c5b14f36dbaa3\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_928fbf35568fcab9681d8270792\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` DROP FOREIGN KEY \`FK_ac00077fd9942e77c6ad2b5bf71\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_2df1f83329c00e6eadde0493e16\``);
        await queryRunner.query(`ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_0374879a971928bc3f57eed0a59\``);
        await queryRunner.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`FK_de08738901be6b34d2824a1e243\``);
        await queryRunner.query(`ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_957d0d10b33ce8de57a0a01e483\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_26b533e15b5f2334c96339a1f08\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9263386c35b6b242540f9493b00\``);
        await queryRunner.query(`ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_145532db85752b29c57d2b7b1f1\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_772d0ce0473ac2ccfa26060dbe9\``);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`stock_quantity\` \`stock_quantity\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`products\` CHANGE \`base_price\` \`base_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`total_price\` \`total_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`unit_price\` \`unit_price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`price\` \`price\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` CHANGE \`quantity\` \`quantity\` int NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total\` \`total\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`total_amount\` \`total_amount\` decimal(10,2) NOT NULL DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` DROP COLUMN \`name\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`is_verified_purchase\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_email\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP COLUMN \`guest_name\``);
        await queryRunner.query(`ALTER TABLE \`review\` ADD \`status\` varchar(255) NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD \`image_url\` varchar(255) NULL`);
        await queryRunner.query(`DROP TABLE \`address\``);
        await queryRunner.query(`DROP TABLE \`discounts\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP TABLE \`shipping\``);
        await queryRunner.query(`DROP TABLE \`product_images\``);
        await queryRunner.query(`DROP INDEX \`IDX_fdb2f3ad8115da4c7718109a6e\` ON \`customer\``);
        await queryRunner.query(`DROP TABLE \`customer\``);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` CHANGE \`wishlist_item_id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`wishlist\` ADD CONSTRAINT \`FK_wishlist_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_wishlist_item_wishlist\` FOREIGN KEY (\`wishlist_id\`) REFERENCES \`wishlist\`(\`wishlist_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`wishlist_item\` ADD CONSTRAINT \`FK_wishlist_item_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_product_category_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_category\` ADD CONSTRAINT \`FK_product_category_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`categories\` ADD CONSTRAINT \`FK_parent_category\` FOREIGN KEY (\`parent_category_id\`) REFERENCES \`categories\`(\`category_id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_review_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_review_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_product\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`product_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_items\` ADD CONSTRAINT \`FK_order_items_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_orders_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`customer_id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
