import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { OrderBookDto } from '../models/OrderBookDto';
import { OrderItemDto } from '../models/OrderItemDto';


@Injectable({
  providedIn: 'root'
})
export class SharedCartService {

  private items: OrderItemDto[] = [];
  private cartBooks = new BehaviorSubject<OrderItemDto[]>([]);
  currentBooks = this.cartBooks.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.items = this.getItems();
      this.cartBooks.next(this.items);
    }
  }

  putBooks(book: OrderBookDto, quantity: number): void {
    const existingItem = this.items.find(item => item.bookDto.id === book.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ bookDto: book, quantity });
    }
    
    this.updateLocalStorage();
    this.cartBooks.next([...this.items]); // Emit a new array reference
  }
  

  getItems(): any[] {
    const items = localStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
  }
  

  private updateLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cartItems', JSON.stringify(this.items));
    }
  }

  clearCart() {
    if (isPlatformBrowser(this.platformId)) {
      this.items = [];
      this.updateLocalStorage();
      this.cartBooks.next(this.items);
    }
  }

  updateQuantity(bookId: number, quantity: number) {
    const index = this.items.findIndex(i => i.bookDto.id === bookId);
    if (index > -1 && quantity > 0) {
      this.items[index].quantity = quantity;
      this.updateLocalStorage();
      this.cartBooks.next(this.items);
    }
  }

  removeBook(bookId: number) {
    this.items = this.items.filter(i => i.bookDto.id !== bookId);
    this.updateLocalStorage();
    this.cartBooks.next(this.items);
  }

  getTotalQuantity(): number {
     return this.items.reduce((acc, book) => acc + (book.quantity), 0)
  }
}




