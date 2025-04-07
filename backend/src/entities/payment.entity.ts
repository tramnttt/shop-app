import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    payment_id: number;

    @Column()
    order_id: number;

    @Column()
    payment_method: string;

    @Column({ nullable: true })
    transaction_id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    status: string;

    @Column({ nullable: true })
    payment_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Order, order => order.payments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;
} 