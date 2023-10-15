import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AppError } from '../entity/app-error';
import { inject } from '@angular/core';
import { ErrorService } from '../services/error.service';

export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const errorService = inject(ErrorService);

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      const error: AppError = {
        status: 0,
        details: '',
        message: '',
      };

      if (err.status === 404) {
        debugger;
        error.status = 404;
        error.message = 'Обьект не найден';

        return throwError(() => error);
      }

      if (err.status === 500 || err.status === 0) {
        error.status = 500;
        error.message = 'Сервисы не отвечают';
        error.details = 'Перезагрузите страницу или попробуйте позже';

        errorService.show(error);

        return throwError(() => err);
      }

      error.status = err.status;
      error.message = err.message;

      return throwError(() => error);
    }),
  );
};
