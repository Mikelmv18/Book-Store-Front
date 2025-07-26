import { OrderItemDto } from "./OrderItemDto";

export interface OrderDto {
    
    orderId?: number;

    address: string;

    orderStatus?: string;

    orderItems:OrderItemDto[];
}