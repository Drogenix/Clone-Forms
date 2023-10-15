import { Injectable } from '@angular/core';
import { AppError } from '../entity/app-error';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private _errorSub = new BehaviorSubject<AppError | null>(null);
  error$ = this._errorSub.asObservable();

  constructor() {}

  show(error: AppError) {
    this._errorSub.next(error);
  }
}
