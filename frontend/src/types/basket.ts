export interface BasketItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export interface Basket {
    items: BasketItem[];
    total: number;
} 