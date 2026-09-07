import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { RouteReuseStrategy } from '@angular/router';
import { AppComponent } from './app/app.component';
import { inject, provideAppInitializer } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { routes } from './app/app.routes';
import { APP_SERVICE_PROVIDERS } from './app/app.providers';
import { authInterceptor } from './app/core/auth.interceptor';
import { apiErrorInterceptor } from './app/core/api-error.interceptor';
import { networkInterceptor } from './app/core/network.interceptor';
import { AuthService } from './app/models/service.interfaces';
bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([networkInterceptor, apiErrorInterceptor, authInterceptor])),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ...APP_SERVICE_PROVIDERS,
    provideAppInitializer(() => firstValueFrom(inject(AuthService).restore())),
  ],
}).catch(console.error);
