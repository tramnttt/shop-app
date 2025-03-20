import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductCategory } from './product-category.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    category_id: number;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({ nullable: true })
    parent_category_id: number;

    @ManyToOne(() => Category, { nullable: true })
    @JoinColumn({ name: 'parent_category_id' })
    parent_category: Category;

    @OneToMany(() => Category, category => category.parent_category)
    subCategories: Category[];

    @OneToMany(() => ProductCategory, productCategory => productCategory.category)
    productCategories: ProductCategory[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;
} 