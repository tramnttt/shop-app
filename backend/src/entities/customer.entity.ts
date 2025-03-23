import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class Customer {
    @PrimaryGeneratedColumn()
    customer_id: number;

    @Column()
    first_name: string;

    @Column()
    last_name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password_hash: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ default: 'customer' })
    role: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @Column({ nullable: true })
    last_login: Date;
} 