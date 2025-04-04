-- Create orders table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` int NOT NULL AUTO_INCREMENT,
    `customer_id` int NULL,
    `total_amount` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `total` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `shipping_address_id` int NULL,
    `billing_address_id` int NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Create order_items table
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` int NOT NULL AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_id` int NOT NULL,
    `name` varchar(255) NOT NULL,
    `quantity` int NOT NULL DEFAULT 1,
    `price` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `unit_price` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `total_price` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `image_url` varchar(255) NULL,
    `customization_details` text NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Create products table
CREATE TABLE IF NOT EXISTS `products` (
    `product_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `base_price` decimal(10, 2) NOT NULL DEFAULT '0.00',
    `sale_price` decimal(10, 2) NULL,
    `sku` varchar(255) NOT NULL,
    `stock_quantity` int NOT NULL DEFAULT 0,
    `is_featured` tinyint NOT NULL DEFAULT 0,
    `metal_type` varchar(255) NULL,
    `gemstone_type` varchar(255) NULL,
    `weight` decimal(10, 2) NULL,
    `dimensions` varchar(255) NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`product_id`)
) ENGINE = InnoDB;

-- Create product_image table
CREATE TABLE IF NOT EXISTS `product_image` (
    `image_id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `image_url` varchar(255) NOT NULL,
    `alt_text` varchar(255) NULL,
    `is_primary` tinyint NOT NULL DEFAULT 0,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`image_id`)
) ENGINE = InnoDB;

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
    `category_id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` text NULL,
    `parent_category_id` int NULL,
    `image_url` varchar(255) NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`category_id`)
) ENGINE = InnoDB;

-- Create product_category table
CREATE TABLE IF NOT EXISTS `product_category` (
    `product_id` int NOT NULL,
    `category_id` int NOT NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`product_id`, `category_id`)
) ENGINE = InnoDB;

-- Create customers table
CREATE TABLE IF NOT EXISTS `customers` (
    `customer_id` int NOT NULL AUTO_INCREMENT,
    `first_name` varchar(255) NOT NULL,
    `last_name` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL DEFAULT '',
    `password_hash` varchar(255) NOT NULL,
    `phone` varchar(255) NULL,
    `role` varchar(255) NOT NULL DEFAULT 'customer',
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    `last_login` datetime NULL,
    UNIQUE INDEX `IDX_8536b8b85c06969f84f0c098b0` (`email`),
    PRIMARY KEY (`customer_id`)
) ENGINE = InnoDB;

-- Create review table
CREATE TABLE IF NOT EXISTS `review` (
    `review_id` int NOT NULL AUTO_INCREMENT,
    `product_id` int NOT NULL,
    `customer_id` int NULL,
    `rating` int NOT NULL,
    `comment` text NULL,
    `status` varchar(255) NOT NULL DEFAULT 'pending',
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`review_id`)
) ENGINE = InnoDB;

-- Create wishlist table
CREATE TABLE IF NOT EXISTS `wishlist` (
    `wishlist_id` int NOT NULL AUTO_INCREMENT,
    `customer_id` int NOT NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`wishlist_id`)
) ENGINE = InnoDB;

-- Create wishlist_item table
CREATE TABLE IF NOT EXISTS `wishlist_item` (
    `id` int NOT NULL AUTO_INCREMENT,
    `wishlist_id` int NOT NULL,
    `product_id` int NOT NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deleted_at` datetime(6) NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Create migrations table required by TypeORM
CREATE TABLE IF NOT EXISTS `migrations` (
    `id` int NOT NULL AUTO_INCREMENT,
    `timestamp` bigint NOT NULL,
    `name` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- Add foreign keys
ALTER TABLE
    `orders`
ADD
    CONSTRAINT `FK_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE
SET
    NULL ON UPDATE NO ACTION;

ALTER TABLE
    `order_items`
ADD
    CONSTRAINT `FK_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `order_items`
ADD
    CONSTRAINT `FK_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `product_image`
ADD
    CONSTRAINT `FK_product_image_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `product_category`
ADD
    CONSTRAINT `FK_product_category_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `product_category`
ADD
    CONSTRAINT `FK_product_category_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `categories`
ADD
    CONSTRAINT `FK_parent_category` FOREIGN KEY (`parent_category_id`) REFERENCES `categories`(`category_id`) ON DELETE
SET
    NULL ON UPDATE NO ACTION;

ALTER TABLE
    `review`
ADD
    CONSTRAINT `FK_review_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `review`
ADD
    CONSTRAINT `FK_review_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE
SET
    NULL ON UPDATE NO ACTION;

ALTER TABLE
    `wishlist`
ADD
    CONSTRAINT `FK_wishlist_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `wishlist_item`
ADD
    CONSTRAINT `FK_wishlist_item_wishlist` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlist`(`wishlist_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE
    `wishlist_item`
ADD
    CONSTRAINT `FK_wishlist_item_product` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- Insert all migrations as if they have been executed to avoid running them
INSERT INTO
    `migrations` (`timestamp`, `name`)
VALUES
    (1743744927552, 'InitialDbSetup1743744927552'),
    (1712165975193, 'AddOrderFields1712165975193'),
    (
        1743607645246,
        'AddOrderItemPriceNew1743607645246'
    ),
    (1743607686458, 'AddPriceColumnOnly1743607686458'),
    (
        1743707580500,
        'AddMissingColumnsAll1743707580500'
    ),
    (1743727715585, 'FixForeignKeyDrop1743727715585'),
    (
        1743727762498,
        'SafeDropForeignKeys1743727762498'
    ),
    (
        1743727817704,
        'FixOrdersCustomerFK1743727817704'
    ),
    (
        1743727920641,
        'CreateOrderCustomerFK1743727920641'
    ),
    (1743730136591, 'FixMissingColumns1743730136591');