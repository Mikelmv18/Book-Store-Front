import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BookDto, PaginatedResponse } from '../models/BookDto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  
  private URL = "http://localhost:8080/books";

  
  constructor(private http: HttpClient,
    private router: Router
  ) {}


  addBook(formData: FormData): Observable<BookDto> {
    return this.http.post<BookDto>(`${this.URL}/add`, formData);
  }

  
  getBooks(page: number, size: number, sortBy: string, ascending: boolean): Observable<PaginatedResponse<BookDto>> {
    return this.http.get<PaginatedResponse<BookDto>>(
      `${this.URL}/?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}`
    );
  }

  getBookById(id:number): Observable<BookDto> {
    return this.http.get<BookDto>(
      `${this.URL}/${id}`
    );
  }

  updateBook(book:FormData,id:number): Observable<BookDto> {
    return this.http.put<BookDto>(`${this.URL}/update/${id}`, book);
  }

  deleteBook(id:number): Observable<string> {
    return this.http.delete<string>(`${this.URL}/delete/${id}`)
  }

  uploadImage(formData: FormData): Observable<string> {
    return this.http.post(`${this.URL}/upload`, formData, {
      responseType: 'text' // because the endpoint returns plain text path
    });
  }

  getBookByCategory(page: number, size: number, sortBy: string, ascending: boolean,
    category:string): Observable<PaginatedResponse<BookDto>> {

      return this.http.get<PaginatedResponse<BookDto>>(`${this.URL}/category?page=${page}&size=${size}&sortBy=${sortBy}&ascending=${ascending}&category=${category}`);
  }
  
  
  


}
