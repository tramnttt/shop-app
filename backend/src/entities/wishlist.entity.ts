import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Customer } from './customer.entity';
import { WishlistItem } from './wishlist-item.entity';

@Entity()
export class Wishlist {
    @PrimaryGeneratedColumn()
    wishlist_id: number;

    @Column()
    customer_id: number;

    @Column()
    name: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => WishlistItem, wishlistItem => wishlistItem.wishlist)
    wishlistItems: WishlistItem[];
} 