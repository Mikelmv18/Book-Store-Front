import { ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {BookComponent } from './book/book';
import { BookDto } from '../../models/BookDto';
import { BookService } from '../../services/bookservice';
import { Subscription } from 'rxjs';
import { ActivatedRoute,RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  imports:[RouterLink,FormsModule,BookComponent,CommonModule,RouterOutlet],
  templateUrl: './home.html',
  styleUrl:'./home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  books: BookDto[] = [];
  category: string | null = null;
  page: number = 0;
  size: number = 6;
  totalPages: number = 0;
  private routeSub!: Subscription;

  categories: string[] = [
    'Roman',
    'Non_Fiction',
    'Science',
    'History',
    'Biography',
    'Fantasy',
    'Mystery',
    'Romance',
    'Children',
    'Self_Help'
  ];

  constructor(
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.activatedRoute.queryParams.subscribe(params => {
      this.category = params['category'] || null;
      this.page = 0; // Reset page when category changes
      this.loadBooks();
    });
  }

  ngOnDestroy(): void { // Added ngOnDestroy
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadBooks(): void {
    
    if (this.category) {
      this.bookService
        .getBookByCategory(this.page, this.size, 'createdAt', true, this.category)
        .subscribe({
          next: (response) => {
            this.books = response.content;
            this.totalPages = response.totalPages;
            this.cdr.detectChanges(); // Trigger change detection
          },
          error: (error) => {
            console.error('Error loading books by category', error);
          }
        });
    } 
    
    else {
      this.bookService.getBooks(this.page, this.size,'createdAt', true).subscribe({
        next: (response) => {
          this.books = response.content;
          this.totalPages = response.totalPages;
          this.cdr.detectChanges(); // Trigger change detection
        },
        error: (error) => {
          console.error('Error loading all books', error);
        }
      });
    }
  }

  trackByBookId(book: BookDto): number { // Added trackBy function
    return book.id;
  }
  

  onBookSelected(updatedBook: BookDto): void {
    const index = this.books.findIndex(b => b.id === updatedBook.id);
    if (index !== -1) this.books[index] = updatedBook;
  }

  onBookAdded(event: BookDto): void {
    setTimeout(() => {
      if (this.books.length >= this.size) {
        this.page++;         // move to next page
        this.cdr.detectChanges(); // force UI update
      } 
        
      this.loadBooks();    // in case not going to next page
      
    }, 100);
  }

  onDeleteBook(deletedBook: BookDto): void {
    setTimeout(() => {
      // After deletion, reload books — but check if we were on a page with only one item
      if (this.books.length === 1 && this.page > 0) {
        // Go to previous page if we deleted the last item on the current page
        this.page--;
      }
      this.loadBooks();
    }, 100);
  }
  

  onBookUpdated(updatedBook: BookDto): void {
    this.books = this.books.map(book =>
      book.id === updatedBook.id ? updatedBook : book
    );
  }
  
  nextPage(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadBooks();
    }
  }

  previousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadBooks();
    }
  }
}


