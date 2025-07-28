import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { UserStorage } from './services/localstorage/user-storage';
import { AuthService } from './services/auth/auth';
import { SharedCartService } from './services/shared-cart';
import { PrimeNG } from 'primeng/config';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BookService } from './services/bookservice';
import { BookResponseDto } from './models/BookDto';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule,ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Book-Store';
  isUserLoggedIn = false;
  totalAdded: number = 0;
  books: BookResponseDto[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedCartService,
    private primeng: PrimeNG,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder)

  {}

  ngOnInit(): void {
  
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to ensure this runs after initial rendering
      setTimeout(() => {
        this.updateAuthState();
      });

      this.router.events.subscribe(() => {
        this.updateAuthState();
      });
    }
  }

  private updateAuthState(): void {
    const token = UserStorage.getToken();
    
    if (token && UserStorage.isTokenExpired(token)) {
      this.logoutUser();
      return;
    }
    
    const newAuthState = UserStorage.isLoggedIn();
    if (this.isUserLoggedIn !== newAuthState) {
      this.isUserLoggedIn = newAuthState;
      this.cdr.detectChanges();
    }
  }

  getOrders() {
    if(UserStorage.isAdminLoggedIn()) {
      this.router.navigateByUrl('/admin');
    }
    else {
      this.router.navigateByUrl('/orders');
    }
  }

  logoutUser() {
    this.authService.logout();
  }
  

  totalItems() {
    return this.sharedService.getTotalQuantity();
  }
}