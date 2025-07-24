import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookDto } from '../models/BookDto';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  book: BookDto;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class SharedCartService {

  private items: CartItem[] = [];
  private cartBooks = new BehaviorSubject<CartItem[]>([]);
  currentBooks = this.cartBooks.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.items = this.getItems();
      this.cartBooks.next(this.items);
    }
  }

  putBooks(book: BookDto, quantity: number): void {
    const existingItem = this.items.find(item => item.book.id === book.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ book, quantity });
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
    const index = this.items.findIndex(i => i.book.id === bookId);
    if (index > -1 && quantity > 0) {
      this.items[index].quantity = quantity;
      this.updateLocalStorage();
      this.cartBooks.next(this.items);
    }
  }

  removeBook(bookId: number) {
    this.items = this.items.filter(i => i.book.id !== bookId);
    this.updateLocalStorage();
    this.cartBooks.next(this.items);
  }

  getTotalQuantity(): number {
     return this.items.reduce((acc, book) => acc + (book.quantity), 0)
  }
}
