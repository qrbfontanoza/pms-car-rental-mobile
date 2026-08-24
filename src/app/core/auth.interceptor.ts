import { HttpInterceptorFn } from '@angular/common/http';
// Future token hook. Mock mode intentionally sends no Authorization header.
export const authInterceptor: HttpInterceptorFn = (request, next) => next(request);
