import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderItemDto } from '../../../../models/OrderItemDto';
import { OrderDto } from '../../../../models/OrderDto';
import { Route, Router } from '@angular/router';
import { OrderService } from '../../../../services/order/order-service';
import { SharedCartService } from '../../../../services/shared-service/shared-cart';


@Component({
  selector: 'app-view-cart',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-cart.html',
  styleUrl: './view-cart.css'
})
export class ViewCart implements OnInit {

  books: OrderItemDto[] = [];
  total: number = 0;
  bookId: number;
  message: string = '';
  order: OrderDto;

  deliveryAddress: string = '';
  addressSuggestions: Array<{ display_name: string; lat: string; lon: string }> = [];
  showSuggestions: boolean = false;
  @ViewChild('suggestionContainer') suggestionContainer!: ElementRef;

  constructor(private sharedService: SharedCartService,
    private orderService: OrderService, private router: Router
  ) {
    this.order = {
      address: this.deliveryAddress,
      orderItems: this.books
    };
  }

  ngOnInit() {
    this.sharedService.currentBooks.subscribe(items => {
      this.books = items;
    });
  }

  increaseQuantity(item: OrderItemDto) {
    if (item.quantity < item.bookDto.stock) {
      item.quantity++;
      item.message = '';
    } else {
      item.message = `Only ${item.bookDto.stock} in stock.`;
      setTimeout(() => item.message = '', 4);
    }
    this.sharedService.updateQuantity(item.bookDto.id, item.quantity);
  }

  decreaseQuantity(item: OrderItemDto) {
    if (item.quantity > 1) {
      item.quantity--;
      this.sharedService.updateQuantity(item.bookDto.id, item.quantity);
    }
  }

  updateQuantity(item: OrderItemDto) {
    if (item.quantity < 1) item.quantity = 1;
    this.sharedService.updateQuantity(item.bookDto.id, item.quantity);
  }

  onRemoveClick(event: MouseEvent, bookId: number) {
    event.stopPropagation(); // Prevent bubbling
    this.removeBook(bookId);
  }

  removeBook(bookId: number) {
    this.sharedService.removeBook(bookId);
  }

  totalToBePaid(): number {
    return this.books.reduce((acc, book) => acc + (book.bookDto.price * book.quantity), 0);
  }

  clearCart() {
    this.sharedService.clearCart();
  }

  // New method: called when user types in the deliveryAddress input
  onAddressInputChange() {
    if (this.deliveryAddress.length < 3) {
      this.addressSuggestions = [];
      this.showSuggestions = false;
      return;
    }
  
    // Call your backend proxy instead of Nominatim directly
    fetch(
      `http://localhost:8080/orders/address-search?q=${encodeURIComponent(this.deliveryAddress)}`
    )
      .then(response => response.json())
      .then((results: any[]) => {
        this.addressSuggestions = results;
        this.showSuggestions = this.addressSuggestions.length > 0;
      })
      .catch(() => {
        this.addressSuggestions = [];
        this.showSuggestions = false;
      });
  }
  
  // When user clicks a suggestion, set it as deliveryAddress and hide suggestions
  selectSuggestion(suggestion: { display_name: string }) {
    this.deliveryAddress = suggestion.display_name;
    this.addressSuggestions = [];
    this.showSuggestions = false;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.suggestionContainer?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showSuggestions = false;
    }
  }

  checkout() {
    this.order.address = this.deliveryAddress;
    this.order.orderItems = this.books;

    this.order.orderItems.forEach((order) => console.log(order.bookDto.id));

    console.log("ordered books",this.order.orderItems)

    this.orderService.addOrder(this.order).subscribe(order => {
      this.router.navigateByUrl('/home');
      this.clearCart();
    })

  }

}
