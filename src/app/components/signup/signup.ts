import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true, 
  imports: [CommonModule, FormsModule, HttpClientModule,ReactiveFormsModule,RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})

export class Signup {
   
  public formdata!: FormGroup;
  protected emptyFieldMessage!: string;
  protected errorFields !: boolean;
  public backendErrors: { [key: string]: string } = {};


  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder:FormBuilder
  ) 
  {
    this.formdata = this.formBuilder.group({
    fullName: ['',[Validators.required]],
    email:['',[Validators.email,Validators.required]],
    password:['',[Validators.required]],
    confirmpassword: ['',[Validators.required]]
  
  })
}
  
 
signUpUser(): void {
  if (
    !this.formdata?.get('fullName')?.value ||
    !this.formdata.get('email')?.value ||
    !this.formdata.get('password')?.value ||
    !this.formdata.get('confirmpassword')?.value
  ) {
    this.errorFields = true;
    this.emptyFieldMessage = 'Fill all the fields';
    return;
  }

  const user = {
    fullName: this.formdata?.get('fullName')?.value,
    email: this.formdata?.get('email')?.value,
    password: this.formdata?.get('password')?.value,
    confirmPassword: this.formdata?.get('confirmpassword')?.value 
  };

  localStorage.removeItem('token');

  this.authService.signup(user).subscribe({
    next: () => {
      this.router.navigate(['/login']);
    },
    error: (err) => {
      this.errorFields = true;
      this.backendErrors = err.error || {};
      console.error('Component error:', err);
    }
  });
}


}
