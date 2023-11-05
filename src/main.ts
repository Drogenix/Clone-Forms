import {
  TUI_ALERT_POSITION,
  TuiAlertModule,
  TuiDialogModule,
  TuiRootModule,
} from '@taiga-ui/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideRouter, withRouterConfig } from '@angular/router';
import { routes } from './app/routes';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import localeRu from '@angular/common/locales/ru';
import { registerLocaleData } from '@angular/common';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';
import { UserService } from './app/core/services/user.service';
import { LocalStorageService } from './app/core/services/local-storage.service';
import { Observable } from 'rxjs';
import { responseInterceptor } from './app/core/interceptors/data-response.interceptor';

registerLocaleData(localeRu, 'ru');

function checkAuth(userService: UserService): () => Observable<any> {
  return () => userService.checkAuth();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      TuiRootModule,
      TuiDialogModule,
      FormsModule,
      TuiAlertModule,
    ),
    provideRouter(
      routes,
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideHttpClient(withInterceptors([errorInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: checkAuth,
      multi: true,
      deps: [UserService, HttpClient, LocalStorageService],
    },
    { provide: TUI_ALERT_POSITION, useValue: 'var(--tui-alert-margin)' },
  ],
}).catch((err) => console.error(err));
