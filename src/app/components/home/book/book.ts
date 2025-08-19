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


@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink,MatCardModule, MatButtonModule],
  templateUrl: './book.html',
  styleUrls: ['./book.css']
})
export class BookComponent {
  @Input() books: BookResponseDto[] = [];
  @Output() selectedBook = new EventEmitter<BookDto>();
  @Output() addedBook = new EventEmitter<BookDto>();
  @Output() deletedBook = new EventEmitter<BookDto>();
  @Output() updatedBook = new EventEmitter<BookDto>();
  formdata: FormGroup;
  selectedFile: File | null = null;
  isSubmitted: boolean = false;
  selectedCategory: string;
  categories: string[] = [];
 

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
      
    this.categories = constants.categories;

  }

  deleteBook(id: number) {
    this.bookService.getBookById(id).subscribe(book => {
      this.bookService.deleteBook(book.id).subscribe(() => {
        this.deletedBook.emit(book);
      });
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
}