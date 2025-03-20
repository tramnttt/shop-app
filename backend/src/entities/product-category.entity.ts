import { Entity, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity()
export class ProductCategory {
    @PrimaryColumn()
    product_id: number;

    @PrimaryColumn()
    category_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Product, product => product.productCategories)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Category, category => category.productCategories)
    @JoinColumn({ name: 'category_id' })
    category: Category;
} 