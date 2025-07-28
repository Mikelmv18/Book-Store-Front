import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OrderDto } from '../models/OrderDto';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/BookDto';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  
  private URL = "http://localhost:8080/orders";

  constructor(private http: HttpClient
  ) {}

  addOrder(order: OrderDto): Observable<OrderDto> {
      return this.http.post<OrderDto>(`${this.URL}/`, order);
  }

  getOrders(page: number, size: number, sortBy: string, ascending: boolean): 
  Observable<PaginatedResponse<OrderDto>> {
      
    return this.http.get<PaginatedResponse<OrderDto>>(
        `${this.URL}/?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`
      );
    }

    updateOrderStatus(id:number, status:string): Observable<OrderDto> {
        return this.http.put<OrderDto>(`${this.URL}/${id}?status=${status}`,{});
    }

    getOrdersByDate(startDate:string, endDate:string,  page: number, size: number, sortBy: string = 'createdAt', ascending: boolean = true): Observable<PaginatedResponse<OrderDto>> {
      return this.http.get<PaginatedResponse<OrderDto>>(`${this.URL}/dates?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}&startDate=${startDate}&endDate=${endDate}`);
    }
}
