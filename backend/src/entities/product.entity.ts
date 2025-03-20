import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { WishlistItem } from './wishlist-item.entity';
import { Review } from './review.entity';
import { ProductImage } from './product-image.entity';
import { ProductCategory } from './product-category.entity';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    base_price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    sale_price: number;

    @Column()
    sku: string;

    @Column('int')
    stock_quantity: number;

    @Column('boolean', { default: false })
    is_featured: boolean;

    @Column({ nullable: true })
    metal_type: string;

    @Column({ nullable: true })
    gemstone_type: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    weight: number;

    @Column({ nullable: true })
    dimensions: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.product)
    orderItems: OrderItem[];

    @OneToMany(() => WishlistItem, wishlistItem => wishlistItem.product)
    wishlistItems: WishlistItem[];

    @OneToMany(() => Review, review => review.product)
    reviews: Review[];

    @OneToMany(() => ProductImage, productImage => productImage.product)
    images: ProductImage[];

    @OneToMany(() => ProductCategory, productCategory => productCategory.product)
    productCategories: ProductCategory[];
} 