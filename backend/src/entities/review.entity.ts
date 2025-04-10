import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Product } from './product.entity';

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    review_id: number;

    @Column()
    product_id: number;

    @Column({ nullable: true })
    customer_id: number;

    @Column({ nullable: true })
    guest_name: string;

    @Column({ nullable: true })
    guest_email: string;

    @Column()
    rating: number;

    @Column('text', { nullable: true })
    comment: string;

    @Column({ default: false })
    is_verified_purchase: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => Customer, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
} 