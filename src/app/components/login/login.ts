import { Component, Input, Output } from '@angular/core';
import { AuthService } from '../../services/auth/auth';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule,ReactiveFormsModule,RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})

export class Login {
  
  public addBookForm: FormGroup;
  protected emptyFieldMessage!: string;
  protected errorFields !: boolean;
  public backendErrors: { [key: string]: string } = {};

  constructor(
    private authService: AuthService,
    private router: Router,
    private formBuilder:FormBuilder
  ) 
  {
    this.addBookForm = this.formBuilder.group({
    email:['',Validators.required],
    password:['',Validators.required]
  
  })
}

  
  loginUser(): void {

    if (
      !this.addBookForm.get('email')?.value ||
      !this.addBookForm.get('password')?.value
    ) 
    
    {
      this.errorFields = true;
      this.emptyFieldMessage = 'Fill all the fields';
      return;
    }
    
    this.authService.login(this.addBookForm?.get('email')?.value, 
    this.addBookForm?.get('password')?.value).subscribe({
    
    next: () => {
    this.router.navigate(['/home']);
   },
   error: (err) => {
    this.errorFields = true;

    this.backendErrors = err.error && err.error.description
    ? { description: err.error.description } : {};

    
  }
  });
}
}