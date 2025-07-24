import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookDto } from '../../../../models/BookDto';
import { CartItem, SharedCartService } from '../../../../services/shared-cart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-cart',
  imports: [CommonModule,FormsModule],
  templateUrl: './view-cart.html',
  styleUrl: './view-cart.css'
})
export class ViewCart implements OnInit {
  

  books: CartItem[] = [];
  total: number = 0;

  constructor(private sharedService: SharedCartService
  ){}
  
  ngOnInit() {
  this.sharedService.currentBooks.subscribe(items => {
    this.books = items;
  });
  }

 increaseQuantity(item: CartItem) {
  item.quantity++;
  this.sharedService.updateQuantity(item.book.id, item.quantity);
 }

decreaseQuantity(item: CartItem) {
  if (item.quantity > 1) {
    item.quantity--;
    this.sharedService.updateQuantity(item.book.id, item.quantity);
  }
}

updateQuantity(item: CartItem) {
  if (item.quantity < 1) item.quantity = 1;
  this.sharedService.updateQuantity(item.book.id, item.quantity);
}

removeBook(bookId: number) {
  this.sharedService.removeBook(bookId);
}

totalToBePaid(): number {
  return this.books.reduce((acc, book) => acc + (book.book.price * book.quantity), 0);
}


}
