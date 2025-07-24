import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList
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
import { BookDto } from '../../../models/BookDto';
import { BookService } from '../../../services/bookservice';
import { Router, RouterLink } from '@angular/router';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './book.html',
  styleUrls: ['./book.css']
})
export class BookComponent implements OnInit, AfterViewInit {
  @Input() books: BookDto[] = [];
  @Output() selectedBook = new EventEmitter<BookDto>();
  @Output() addedBook = new EventEmitter<BookDto>();
  @Output() deletedBook = new EventEmitter<BookDto>();
  @Output() updatedBook = new EventEmitter<BookDto>();
  formdata: FormGroup;
  addform: FormGroup;
  selectedFile: File | null = null;
  isSubmitted: boolean = false;

  @ViewChild('addBookModal') addBookModal!: ElementRef;
  @ViewChildren('editModal') editModals!: QueryList<ElementRef>;
  
  private addModalInstance?: Modal;
  private editModalInstances: Modal[] = [];

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router:Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.formdata = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      description:[''],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      book_cover: ['']  
    });
    
    this.addform = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      author: ['', Validators.required],
      category: ['', Validators.required],
      description:['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required],
      book_cover: [''] 
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedTitle = sessionStorage.getItem('draftTitle');
      if (savedTitle) {
        this.formdata.patchValue({ title: savedTitle });
      }
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('bootstrap').then((bootstrap) => {
        // Initialize add modal
        if (this.addBookModal) {
          this.addModalInstance = new bootstrap.Modal(this.addBookModal.nativeElement);
        }
        
        // Initialize all edit modals
        this.editModals.forEach(modal => {
          this.editModalInstances.push(new bootstrap.Modal(modal.nativeElement));
        });
      });
    }
  }
  
  closeAllModals(): void {
    if (this.addModalInstance) {
      this.addModalInstance.hide();
    }
    
    this.editModalInstances.forEach(instance => {
      instance.hide();
    });

    this.removeBackdrop();
  }

  private removeBackdrop(): void {
    if (isPlatformBrowser(this.platformId)) {
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
  }

  trackByBookId(index: number, book: BookDto): number { 
    return book.id;
  }

  setBookById(id: number): void {
    this.bookService.getBookById(id).subscribe((book) => {
      this.formdata.patchValue(book);
      this.selectedFile = null;
      this.selectedBook.emit(book);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      if (isPlatformBrowser(this.platformId)) {
        sessionStorage.setItem('draftCoverName', this.selectedFile.name);
      }
    }
  }

  private cleanUpBackdrop(): void {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.parentNode?.removeChild(backdrop);
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
  

  closeAddModal(): void {
    if (this.addModalInstance) {
      this.addModalInstance.hide();
    }
    this.cleanUpBackdrop();
  }
  

  OnAddBook(): void {
    if (this.addform.invalid || !this.selectedFile) {
      console.warn("Form invalid or no file selected");
      return;
    }
  
    const bookPayload = {
      ...this.addform.value
    };
  
    this.isSubmitted = true;
  
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(bookPayload)], { type: 'application/json' }));
    formData.append('file', this.selectedFile);
  
    this.bookService.addBook(formData).subscribe({
      next: (createdBook: BookDto) => {
        this.addedBook.emit(createdBook);
        this.addform.reset();
        this.selectedFile = null;
        sessionStorage.removeItem('draftCoverName');
        this.closeAddModal();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error adding book:', err);
        this.isSubmitted = false;
      }
    });
  }
  
  OnUpdateBook(): void {
    if (this.formdata.invalid) return;
  
    const submitted = this.formdata.value;
    const bookPayload = {
      ...this.formdata.value
    };
  
    this.isSubmitted = true;
  
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(bookPayload)], { type: 'application/json' }));
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }
    
    this.bookService.updateBook(formData, submitted.id).subscribe({
      next: (updatedBook) => {
        this.updatedBook.emit(updatedBook);
        this.formdata.reset();
        this.selectedFile = null;
        sessionStorage.removeItem('draftCoverName');
        this.isSubmitted = false;
        this.closeAllModals();
      },
      error: (err) => {
        console.error('Error updating book:', err);
        this.isSubmitted = false;
      }
    });
  }

  deleteBook(id: number) {
    this.bookService.getBookById(id).subscribe(book => {
      this.bookService.deleteBook(book.id).subscribe(() => {
        this.deletedBook.emit(book);
      });
    });
  }

  trackByTitle(index: number, book: BookDto): string {
    return book.title;
  }
}