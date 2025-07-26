import { OrderBookDto } from "./OrderBookDto";

export interface OrderItemDto {
    bookDto: OrderBookDto;
    quantity: number;
    message?: string; 
  }