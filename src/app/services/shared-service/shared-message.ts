import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedMessage {

  private isBookAdded = signal<boolean>(false);
  private operationType = signal<'add' | 'edit'>('add');

  get IsBookAdded() {
    return this.isBookAdded.asReadonly();
  }

  get OperationType() {
    return this.operationType.asReadonly();
  }

  setIsBookAdded(value: boolean, operation: 'add' | 'edit' = 'add') {
    this.operationType.set(operation);
    this.isBookAdded.set(value);
  }

  
  
}
