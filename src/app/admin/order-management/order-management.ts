import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { OrderDto } from '../../models/OrderDto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-order-management',
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
  templateUrl: './order-management.html',
  styleUrl: './order-management.css'
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  rows: number = 4;
  page: number = 0;
  first: number = 0;
  totalPages: number = 0;
  totalRecords: number = 0;
  orders: OrderDto[] = [];
  private orderSub!: Subscription;
  status: string;
  isLoading: boolean = true;
  isUpdatingStatus: boolean = false;
  isActive: boolean = false;
  selectedDate: string;
  startDate: Date;
  endDate: Date;
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
    const savedPage = localStorage.getItem('orderPage');
    this.page = savedPage ? parseInt(savedPage) : 0;
    this.first = this.page * this.rows;
   }

  ngOnDestroy(): void {
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
  }

  private resetPagination(): void {
    this.page = 0;
    this.first = 0;
    localStorage.removeItem('orderPage');
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.page = event.page;
    this.rows = event.rows;
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orders = [];

    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }

    if (this.isFilteredByDate && this.startDate && this.endDate) {
      this.loadFilteredOrders();
    } else {
      this.loadAllOrders();
    }
  }

  private loadAllOrders(): void {
    this.orderSub = this.orderService.getOrders(this.page, this.rows, 'createdAt', true).subscribe({
      next: (response) => {
        this.handleOrderResponse(response);
      },
      error: (err) => {
        this.handleOrderError(err);
      }
    });
  }

  filterOrdersByDate() {
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
    const startDateStr = this.formatDate(this.startDate);
    const endDateStr = this.formatDate(this.endDate);

    this.orderSub = this.orderService.getOrdersByDate(
      startDateStr,
      endDateStr,
      this.page,
      this.rows,
      'createdAt',
      true
    ).subscribe({
      next: (response) => {
        this.handleOrderResponse(response);
      },
      error: (err) => {
        this.handleOrderError(err);
      }
    });
  }

  private handleOrderResponse(response: any): void {
    this.orders = response.content;
    this.totalPages = response.totalPages;
    this.totalRecords = response.totalElements;

    if (this.page >= this.totalPages && this.totalPages > 0) {
      this.page = this.totalPages - 1;
      this.loadOrders();
      return;
    }

    localStorage.setItem('orderPage', this.page.toString());
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

  updateOrderStatus(order: OrderDto) {
    this.isUpdatingStatus = true;
  
    this.orderService.updateOrderStatus(order.orderId, order.orderStatus).subscribe({
      next: (response) => {
        this.status = response.orderStatus;
        this.isUpdatingStatus = false;
        this.loadOrders();

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Order updated successfully'
        });
      
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update order status', err);
        this.isUpdatingStatus = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update order status'
        });
        this.cdr.markForCheck();
      }
    });
  }

  onDeleteOrder(deletedOrderId: number): void {
    this.orders = this.orders.filter(order => order.orderId !== deletedOrderId);

    if (this.orders.length === 0 && this.page > 0) {
      this.page--;
      this.loadOrders();
    } else {
      this.cdr.detectChanges();
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  trackByOrderId(index: number, order: OrderDto): number {
    return order.orderId!;
  }
}