import { ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../../services/order-service';
import { OrderDto } from '../../models/OrderDto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

declare var bootstrap: any;

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ButtonModule],
  templateUrl: './order-management.html',
  styleUrl: './order-management.css'
})
export class OrderManagementComponent implements OnInit, OnDestroy {

  page: number = 0;
  size: number = 2;
  totalPages: number = 0;
  orders: OrderDto[] = [];
  private orderSub!: Subscription;
  status: string;
  isLoading: boolean = true;
  isUpdatingStatus: boolean = false;
  isActive: boolean = false;
  originalOrderStatus: string

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadInitialPage();
  }

  ngOnDestroy(): void {
    if (this.orderSub) {
      this.orderSub.unsubscribe();
    }
  }

  private loadInitialPage(): void {
    const storedPage = localStorage.getItem('orderPage');
    this.page = storedPage ? Math.max(0, parseInt(storedPage, 10)) : 0;
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orders = [];
  
    if (this.orderSub) {
      this.orderSub.unsubscribe(); // Unsubscribe previous
    }
  
    this.orderSub = this.orderService.getOrders(this.page, this.size, 'createdAt', true).subscribe({
      next: (response) => {
        this.orders = response.content;
        this.totalPages = response.totalPages;
       
        // Fix invalid page edge case
        if (this.page >= this.totalPages && this.totalPages > 0) {
          this.page = this.totalPages - 1;
          localStorage.setItem('orderPage', this.page.toString());
          this.loadOrders(); // reload after correcting page
          return;
        }
  
        localStorage.setItem('orderPage', this.page.toString());
        this.isLoading = false;
  
        // Force Angular to detect changes
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
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

  goToPreviousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadOrders();
    }
  }

  goToNextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadOrders();
    }
  }

  trackByOrderId(index: number, order: OrderDto): number {
    return order.orderId!;
  }
}
