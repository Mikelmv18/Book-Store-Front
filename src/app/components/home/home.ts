import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal} from '@angular/core';
import {BookComponent } from './book/book';
import { BookDto, BookResponseDto } from '../../models/BookDto';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CommonModule} from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../services/book-service/bookservice';
import { PaginatorModule } from 'primeng/paginator';
import { SharedMessage } from '../../services/shared-service/shared-message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-home',
  imports:[FormsModule,BookComponent,CommonModule,ReactiveFormsModule,
  PaginatorModule,ToastModule],
  templateUrl: './home.html',
  styleUrl:'./home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  books: BookDto[] = [];
  booksResponse: BookResponseDto[] = []
  category: string | null = null;
  page: number = 0;
  size: number = 6;
  totalPages: number = 0;
  isLoading: boolean = true; 
  searchValue: string = '';
  searchForm: FormGroup;
  totalRecords: number = 0;
  categories: string[]  =[];
  private searchSubscription!: Subscription;
  private routeSub!: Subscription;

  constructor(
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sharedMessage: SharedMessage,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchValue: '',
    })
  }
  
  ngOnInit(): void {
    
    this.routeSub = this.activatedRoute.queryParams.subscribe(params => {
      const newCategory = params['category'] || null;
  
      // Force reload if the category is different OR same as before
      if (newCategory !== this.category || this.booksResponse.length === 0) {
        this.category = newCategory;
        this.page = 0;
        this.loadBooks();
      }
    });
  }
  

  ngOnDestroy(): void {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
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
    })
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
    }

    else {
      setTimeout(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Book updated successfully'
        });
       });
    }this.sharedMessage.setIsBookAdded(false);
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
        this.cdr.detectChanges(); // Force change detection
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
  
  trackByBookId(book: BookDto): number {
    return book.id;
  }

}

