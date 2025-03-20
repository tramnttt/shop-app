import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('discounts')
export class Discount {
    @PrimaryGeneratedColumn()
    discount_id: number;

    @Column()
    code: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    discount_type: string;

    @Column('int', { nullable: true })
    usage_limit: number;

    @Column('int', { default: 0 })
    times_used: number;

    @Column('boolean', { default: true })
    is_active: boolean;

    @Column('date', { nullable: true })
    start_date: Date;

    @Column('date', { nullable: true })
    end_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;
} 