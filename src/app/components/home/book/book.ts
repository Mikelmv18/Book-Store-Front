import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import {
  CommonModule,
  CurrencyPipe,
  isPlatformBrowser
} from '@angular/common';
import { BookDto, BookResponseDto } from '../../../models/BookDto';
import { RouterLink } from '@angular/router';
import { UserStorage } from '../../../services/localstorage/user-storage';
import { BookService } from '../../../services/book-service/bookservice';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { constants } from '../../../constants/constants';
import { Dialog } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';


@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink,MatCardModule, 
    MatButtonModule,Dialog, ButtonModule, InputTextModule],
  templateUrl: './book.html',
  styleUrls: ['./book.css']
})
export class BookComponent {
  @Input() books: BookResponseDto[] = [];
  @Output() selectedBook = new EventEmitter<BookDto>();
  @Output() addedBook = new EventEmitter<BookDto>();
  @Output() deletedBook = new EventEmitter<BookResponseDto>();
  @Output() updatedBook = new EventEmitter<BookDto>();
  formdata: FormGroup;
  selectedFile: File | null = null;
  isSubmitted: boolean = false;
  selectedCategory: string;
  categories: string[] = [];
  visible: boolean = false;
  selectedBookToDelete: BookResponseDto | null = null;


  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
      
    this.categories = constants.categories;

  }


  confirmDeleteBook() {
    if (!this.selectedBookToDelete) return;
  
    this.bookService.getBookById(this.selectedBookToDelete.id).subscribe(book => {
      const mappedBook = {
        id: book.id,
        book_cover: book.book_cover,
        title: book.title,
        author: book.author,
        price: book.price
      };
      this.deletedBook.emit(mappedBook);
    });
    
    this.bookService.deleteBook(this.selectedBookToDelete.id).subscribe({
      next: () => {
        // Hide modal
        this.visible = false;
       
      },
      error: (err) => {
        console.error('Error deleting book', err);
      }
    });
  }
  

  isUserLoggedIn(): boolean {
    return UserStorage.isUserLoggedIn() || this.isAdminLoggedIn();
  }

  isAdminLoggedIn(): boolean {
    return UserStorage.isAdminLoggedIn();
  }
  

  trackByBookId(index: number, book: BookDto): number { 
    return book.id;
  }

  trackByTitle(index: number, book: BookResponseDto): string {
    return book.title;
  }
  
  showDialog(book?: BookResponseDto) {
    this.selectedBookToDelete = book || null;
    this.visible = true;
  }
}