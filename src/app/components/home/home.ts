import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BookComponent } from './book/book';
import { BookDto, BookResponseDto } from '../../models/BookDto';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../services/book-service/bookservice';
import { PaginatorModule } from 'primeng/paginator';
import { SharedMessage } from '../../services/shared-service/shared-message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AutoComplete } from 'primeng/autocomplete';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    BookComponent,
    CommonModule,
    ReactiveFormsModule,
    PaginatorModule,
    ToastModule,
    AutoComplete
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  books: BookDto[] = [];
  booksResponse: BookResponseDto[] = [];
  category: string | null = null;
  page: number = 0;
  size: number = 8;
  totalPages: number = 0;
  isLoading: boolean = true; 
  searchValue: string = '';
  searchForm: FormGroup;
  totalRecords: number = 0;
  allCategories: string[] = []; 
  categories: string[] = []; 

  private searchSubscription!: Subscription;
  private routeSub!: Subscription;

  constructor(
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sharedMessage: SharedMessage,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      searchValue: '',
    });
  }
  
  ngOnInit(): void {
    this.bookService.getCategories().subscribe((categories: string[]) => {
      this.allCategories = categories;
      this.categories = [...categories];
    });

    this.routeSub = this.activatedRoute.queryParams.subscribe(params => {
      const newCategory = params['category'] || null;
      if (newCategory !== this.category || this.booksResponse.length === 0) {
        this.category = newCategory;
        this.page = 0;
        this.loadBooks();
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }

  filterCategories(event: any) {
    const query = event.query.toLowerCase();
    this.categories = this.allCategories.filter(cat =>
      cat.toLowerCase().includes(query)
    );
  }

  onCategorySelect(event: any) {
    const selectedCategory = event.value; 
    this.category = selectedCategory;
  
    this.router.navigate([], {
      queryParams: { category: this.category }
    });
  
    this.loadBooks();
  }
  
  onPageChange(event: any) {
    this.page = event.page;
    this.size = event.rows;
    this.loadBooks();
  }

  onSearchBook() {
    this.searchValue = this.searchForm.value.searchValue ?? '';
    this.bookService.searchBooks(this.searchValue).subscribe((books) => {
      this.booksResponse = books;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadBooks(): void {
    if (this.sharedMessage.IsBookAdded()) {
      if (this.sharedMessage.OperationType() === 'add') {
        setTimeout(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book added successfully'
          });
        });
      } else {
        setTimeout(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Book updated successfully'
          });
        });
      }
      this.sharedMessage.setIsBookAdded(false);
    }

    this.isLoading = true;
    
    const loadObservable = this.category 
      ? this.bookService.getBookByCategory(this.page, this.size, 'createdAt', false, this.category)
      : this.bookService.getBooks(this.page, this.size, 'createdAt', false);

    loadObservable.subscribe({
      next: (response) => {
        this.booksResponse = response.content;
        this.totalPages = response.totalPages;
        this.totalRecords = response.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading books', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onBookSelected(updatedBook: BookDto): void {
    const index = this.books.findIndex(b => b.id === updatedBook.id);
    if (index !== -1) this.books[index] = updatedBook;
  }

  onBookAdded(event: BookDto): void {
    setTimeout(() => {
      if (this.books.length >= this.size) {
        this.page++;        
        this.cdr.detectChanges(); 
      } 
      this.loadBooks();  
    }, 100);
  }


  onDeleteBook(deletedBook: BookResponseDto): void {
    this.books = this.books.filter(book => book.id !== deletedBook.id);

    if (this.books.length === 0 && this.page > 0) {
      this.page--;
    } else if (this.page === 0 && this.totalPages > 1) {
      this.page++; 
    }

    this.loadBooks();
  }

  onBookUpdated(updatedBook: BookDto): void {
    this.books = this.books.map(book =>
      book.id === updatedBook.id ? updatedBook : book
    );
  }
  
  trackByBookId(book: BookDto): number {
    return book.id!;
  }
}
