import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { CartComponent } from './components/home/cart-component/cart-component';
import { ViewCart } from './components/home/cart-component/view-cart/view-cart';
import { Order } from './components/order/order';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'logout', component: Login },
  { path: 'cart/:bookId', component: CartComponent },
  { path: 'view-cart', component: ViewCart },
  { path: 'orders', component: Order },

  // Lazy load the admin module with its routing
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin-routing-module').then(m => m.AdminRoutingModule)
  }
];
