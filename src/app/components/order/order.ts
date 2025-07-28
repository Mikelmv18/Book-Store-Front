import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { OrderDto } from '../../models/OrderDto';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order-service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';

interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    PaginatorModule,
    MatFormFieldModule,
    MatDatepickerModule,
    TableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order {
  rows: number = 4;
  page: number = 0;
  first: number = 0;
  totalPages: number = 0;
  totalRecords: number = 0;
  orders: OrderDto[] = [];
  private orderSub?: Subscription;
  isLoading: boolean = true;
  selectedDate?: string;
  startDate?: Date;
  endDate?: Date;
  isFilteredByDate: boolean = false;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.restorePagination();
    this.loadOrders();
}

private restorePagination(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedPage = localStorage.getItem('orderPage');
      this.page = savedPage ? parseInt(savedPage) : 0;
      this.first = this.page * this.rows;
    }
  } catch (e) {
    console.error('LocalStorage get error', e);
    this.page = 0;
    this.first = 0;
  }
}


  ngOnDestroy(): void {
    this.orderSub?.unsubscribe();
  }

  private resetPagination(): void {
    this.page = 0;
    this.first = 0;
    this.safeLocalStorageRemove('orderPage');
  }

  onPageChange(event: any): void {
    this.first = event.first ?? 0;
    this.page = event.page ?? 0;
    this.rows = event.rows ?? 4;
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orders = [];
    this.orderSub?.unsubscribe();

    if (this.isFilteredByDate && this.startDate && this.endDate) {
      this.loadFilteredOrders();
    } else {
      this.loadAllOrders();
    }
  }

  private loadAllOrders(): void {
    this.orderSub = this.orderService.getOrdersOfUser(
      this.page,
      this.rows,
      'createdAt',
      true
    ).subscribe({
      next: (response) => this.handleOrderResponse(response),
      error: (err) => this.handleOrderError(err)
    });
  }
  
  filterOrdersByDate(): void {
    if (!this.startDate || !this.endDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Dates',
        detail: 'Please select both start and end dates.',
      });
      return;
    }

    this.isFilteredByDate = true;
    this.resetPagination();
    this.loadOrders();
  }

  private loadFilteredOrders(): void {
    if (!this.startDate || !this.endDate) return;

    const startDateStr = this.formatDate(this.startDate);
    const endDateStr = this.formatDate(this.endDate);

    this.orderSub = this.orderService.getOrdersOfUserByDate(
      startDateStr,
      endDateStr,
      this.page,
      this.rows,
      'createdAt',
      true
    ).subscribe({
      next: (response) => this.handleOrderResponse(response),
      error: (err) => this.handleOrderError(err)
    });
  }

  private handleOrderResponse(response: PaginatedResponse<OrderDto>): void {
    this.orders = response?.content ?? [];
    this.totalPages = response?.totalPages ?? 0;
    this.totalRecords = response?.totalElements ?? 0;

    if (this.page >= this.totalPages && this.totalPages > 0) {
      this.page = this.totalPages - 1;
      this.loadOrders();
      return;
    }

    this.safeLocalStorageSet('orderPage', this.page.toString());
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  private handleOrderError(err: any): void {
    console.error('Error loading orders', err);
    this.isLoading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load orders'
    });
    this.cdr.markForCheck();
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private safeLocalStorageSet(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('LocalStorage set error', e);
    }
  }

  private safeLocalStorageRemove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error('LocalStorage remove error', e);
    }
  }

  trackByOrderId(index: number, order: OrderDto): number {
    return order.orderId ?? index;
  }
}