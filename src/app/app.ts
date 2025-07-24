import { Component, OnInit, Inject } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { UserStorage } from './services/localstorage/user-storage';
import { AuthService } from './services/auth/auth';
import { SharedCartService } from './services/shared-cart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Book-Store';
  isUserLoggedIn = false;
  totalAdded: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedCartService
  ) {}

  ngOnInit(): void {
    
    if (isPlatformBrowser(this.platformId)) {
      
      console.log("TOKEN initial:",localStorage.getItem('token'));
      
      if(UserStorage.isTokenExpired(localStorage.getItem('token'))) {
        console.log("TOKEN EXPIRED");
        this.router.navigateByUrl('/login');
        this.logoutUser();
      }
      
      this.isUserLoggedIn = UserStorage.isLoggedIn();
      
      console.log("IS USER LOGGED IN", this.isUserLoggedIn);
      this.router.events.subscribe(() => {
        this.isUserLoggedIn = UserStorage.isLoggedIn();
       
      });
    }
  }

  logoutUser() {
    this.authService.logout();
  }

  totalItems() {
    return this.sharedService.getTotalQuantity();
  }
}
