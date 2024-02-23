import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {



  return next(req).pipe(
    catchError(( error: HttpErrorResponse) => {
      /*console.log(error.status);
      console.log(error.message);
      console.log(error.error.message);*/
      throw error;
    })
  );

  /*
      return next.handle(request).pipe(

      catchError( (err: HttpErrorResponse) =>  {
        if (err) {
          switch (err.status) {
            case 400:
              ...
              break;
            case 401:
              ...
              break;
            ...
            default:
              ...
              break;
          }
          ...
          throw err;
  ...
  }
  */
};
