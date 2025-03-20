import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Shipping {
    @PrimaryGeneratedColumn()
    shipping_id: number;

    @Column()
    order_id: number;

    @Column()
    carrier: string;

    @Column({ nullable: true })
    tracking_number: string;

    @Column('decimal', { precision: 10, scale: 2 })
    shipping_cost: number;

    @Column()
    status: string;

    @Column({ nullable: true })
    estimated_delivery: Date;

    @Column({ nullable: true })
    actual_delivery: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'order_id' })
    order: Order;
} 