import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wishlist } from './wishlist.entity';
import { Product } from './product.entity';

@Entity()
export class WishlistItem {
    @PrimaryGeneratedColumn()
    wishlist_item_id: number;

    @Column()
    wishlist_id: number;

    @Column()
    product_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @DeleteDateColumn({ nullable: true })
    deleted_at: Date;

    @ManyToOne(() => Wishlist, wishlist => wishlist.wishlistItems)
    @JoinColumn({ name: 'wishlist_id' })
    wishlist: Wishlist;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
} 