import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private postDateFromSubject = new BehaviorSubject<Date>(null);
  private postDateToSubject = new BehaviorSubject<Date>(null);

  constructor() { }

  setPostDateFrom(date: Date): void {
    this.postDateFromSubject.next(date);
  }

  getPostDateFrom(): BehaviorSubject<Date> {
    return this.postDateFromSubject;
  }

  setPostDateTo(date: Date): void {
    this.postDateToSubject.next(date);
  }

  getPostDateTo(): BehaviorSubject<Date> {
    return this.postDateToSubject;
  }
}
