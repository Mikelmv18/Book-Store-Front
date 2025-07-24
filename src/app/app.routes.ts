import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { CartComponent } from './components/home/cart-component/cart-component';
import path from 'path';
import { ViewCart } from './components/home/cart-component/view-cart/view-cart';

export const routes: Routes = [
  { path: '',component: HomeComponent },   
  { path: 'home',component: HomeComponent}, 
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'logout', component: Login },
  {path: 'cart/:bookId', component:CartComponent},
  {path:'view-cart', component:ViewCart}

];
