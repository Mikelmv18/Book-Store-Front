import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BookService } from '../../services/book-service/bookservice';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SharedMessage } from '../../services/shared-service/shared-message';
import { constants } from '../../constants/constants';

@Component({
  selector: 'app-add-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ReactiveFormsModule, CommonModule],
  templateUrl: './add-form.html',
  styleUrl: './add-form.css'
})
export class AddForm implements OnInit {
  categories: string[] = [];
  formdata: FormGroup;
  selectedFile: File | null = null;
  isSubmitted: boolean = false;
  paramValue: string | null = null;
  label = signal<string>('');
  
  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private router:Router,
    private route: ActivatedRoute,
    private sharedMessage: SharedMessage,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
      
    this.categories = constants.categories;
   
    this.formdata = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      author: ['', Validators.required],
      book_cover: ['',Validators.required],
      category: ['', Validators.required],
      description:['', Validators.required],
      price: ['', Validators.required],
      stock: ['', Validators.required]
    });


  }
  
  ngOnInit(): void {
    
    this.paramValue = this.route.snapshot.paramMap.get('bookId');
    
    if (this.paramValue) {
      this.label.set('Edit Book');
      this.bookService.getBookById(+this.paramValue).subscribe({
        next: (book) => {
          this.formdata.patchValue({
            id:book.id,
            title:book.title,
            author:book.author,
            category: book.category,
            description: book.description,
            price: book.price,
            stock: book.stock,
            book_cover: book.book_cover
          })
        },
        error: (err) => {
          console.error('Error fetching book:',err);
        }
      })
    }

    else {
      this.label.set('Add Book');
    }
  } 
  
  
  OnSubmit(): void {
     this.paramValue ? this.OnUpdateBook() : this.onAddBook();
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

  private onAddBook() {
    if (this.formdata.invalid || !this.selectedFile) {
      console.warn("Form invalid or no file selected");
      return;
    }
  
    const bookPayload = {
      ...this.formdata.value
    };
  
    this.isSubmitted = true;
  
    const formData = new FormData();
    formData.append('book', new Blob([JSON.stringify(bookPayload)], { type: 'application/json' }));
    formData.append('file', this.selectedFile);
  
    this.bookService.addBook(formData).subscribe({
      next: () => {
        this.formdata.reset();
        this.selectedFile = null;
        sessionStorage.removeItem('draftCoverName');
        this.sharedMessage.setIsBookAdded(true);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.error('Error adding book:', err);
        this.isSubmitted = false;
      }
    });
  }

  private OnUpdateBook(): void {
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
      next: () => {
        this.formdata.reset();
        this.selectedFile = null;
        sessionStorage.removeItem('draftCoverName');
        this.isSubmitted = false;
        this.sharedMessage.setIsBookAdded(true,'edit');
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.error('Error updating book:', err);
        this.isSubmitted = false;
      }
    });
  }
}
