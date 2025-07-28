export interface BookDto {
    id?:number;
    title: string;
    author: string;
    category: string;
    book_cover: string;
    description?: string;
    price:number;
    stock:number;
}

export interface BookResponseDto {
    id: number;
    book_cover: string;
    title: string;
    author: string;
    price: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
  