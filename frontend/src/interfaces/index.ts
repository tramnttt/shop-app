export interface Product {
    product_id: number;
    name: string;
    description: string;
    base_price: number;
    sale_price?: number;
    sku: string;
    stock_quantity: number;
    is_featured: boolean;
    metal_type?: string;
    gemstone_type?: string;
    weight?: number;
    dimensions?: string;
    created_at: string;
    updated_at: string;
    images: ProductImage[];
    categories: Category[];
}

export interface ProductImage {
    image_id: number;
    product_id: number;
    image_url: string;
    alt_text?: string;
    is_primary: boolean;
}

export interface Category {
    category_id: number;
    name: string;
    description?: string;
    parent_category_id?: number;
    subcategories?: Category[];
    products?: Product[];
}

export interface Customer {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
}

export interface Order {
    order_id: number;
    customer_id: number;
    total_amount: number;
    status: string;
    created_at: string;
    orderItems: OrderItem[];
}

export interface OrderItem {
    order_item_id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: Product;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    first_name: string;
    last_name: string;
    phone?: string;
}

export interface AuthResponse {
    access_token: string;
    user: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface CartItem {
    product: Product;
    quantity: number;
} 