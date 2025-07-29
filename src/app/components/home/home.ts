import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';
import {BookComponent } from './book/book';
import { BookDto, BookResponseDto } from '../../models/BookDto';
import { Subscription } from 'rxjs';
import { ActivatedRoute,RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookService } from '../../services/book-service/bookservice';




@Component({
  selector: 'app-home',
  imports:[RouterLink,FormsModule,BookComponent,CommonModule,RouterOutlet, ReactiveFormsModule],
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
  private routeSub!: Subscription;
  isLoading: boolean = true; 
  searchValue: string = '';
  searchForm: FormGroup;

  categories: Set<string>;

  private searchSubscription!: Subscription;

  constructor(
    private bookService: BookService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      searchValue: '',
    })
  }
  
  ngOnInit(): void {

    this.bookService.getCategories().subscribe((response)=>{
       this.categories = response;
    });
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

  onSearchBook() {
    this.searchValue = this.searchForm.value.searchValue ?? '';
    this.bookService.searchBooks(this.searchValue).subscribe((books) => {
      this.booksResponse = books;
      this.isLoading = false;
      this.cdr.detectChanges();
    })
  }

  loadBooks(): void {
    this.isLoading = true;
    
    const loadObservable = this.category 
      ? this.bookService.getBookByCategory(this.page, this.size, 'createdAt', true, this.category)
      : this.bookService.getBooks(this.page, this.size, 'createdAt', true);

    loadObservable.subscribe({
      next: (response) => {
        this.booksResponse = response.content;
        this.totalPages = response.totalPages;
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


function debounceTime(arg0: number): import("rxjs").OperatorFunction<string, unknown> {
  throw new Error('Function not implemented.');
}

function distinctUntilChanged(): import("rxjs").OperatorFunction<unknown, unknown> {
  throw new Error('Function not implemented.');
}

