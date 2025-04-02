import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate, AfterLoad } from 'typeorm';
import { Customer } from './customer.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    // Getter for backward compatibility
    get order_id(): number {
        return this.id;
    }

    @Column()
    customer_id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    total_amount: number;

    @Column('decimal', { precision: 10, scale: 2 })
    total: number;

    @Column()
    status: string;

    @Column({ nullable: true })
    shipping_address_id: number;

    @Column({ nullable: true })
    billing_address_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => OrderItem, orderItem => orderItem.order)
    orderItems: OrderItem[];
} 