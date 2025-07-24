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

export interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}
  