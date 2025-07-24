import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookService } from '../../../services/bookservice';
import { BookDto } from '../../../models/BookDto';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { SharedCartService } from '../../../services/shared-cart';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-component',
  imports: [CurrencyPipe,CommonModule,RouterLink,FormsModule],
  templateUrl: './cart-component.html',
  styleUrl: './cart-component.css'
})
export class CartComponent implements OnInit {
  
  private routeSub!: Subscription;
  private bookId:number;
  @Input() selectedBook: BookDto;
  selectedQuantity = 1;
  
  
  constructor(private activatedRoute: ActivatedRoute,
  private bookService: BookService, private cdr: ChangeDetectorRef,
  private router: Router, private sharedService:SharedCartService) {}
  
  
  ngOnInit(): void {
    this.routeSub = this.activatedRoute.params.subscribe(params => {
      this.bookId = +params['bookId'] || null;
      this.loadBook();
    });
  }

  loadBook() {
    if(this.bookId) {
      this.bookService.getBookById(this.bookId).subscribe(book => {
        this.selectedBook = book;
        this.cdr.detectChanges();
      })
    }
  }

  addToCart(book: BookDto, quantity: number) {
    this.sharedService.putBooks(book, quantity);
    this.router.navigateByUrl('/view-cart');
  }


}
