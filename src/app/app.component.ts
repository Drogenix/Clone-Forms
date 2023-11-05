import { TuiRootModule } from '@taiga-ui/core';
import { Component, OnInit } from '@angular/core';
import {
  NgSwitch,
  NgSwitchDefault,
  NgSwitchCase,
  NgIf,
  AsyncPipe,
  JsonPipe,
} from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './pages/home/home.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';
import { FormViewComponent } from './pages/form-view/form-view.component';
import { RouterOutlet } from '@angular/router';
import { ErrorService } from './core/services/error.service';
import { ErrorComponent } from './components/error/error.component';
import { Observable } from 'rxjs';
import { AppError } from './core/entity/app-error';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [TuiDestroyService],
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    HeaderComponent,
    HomeComponent,
    TuiRootModule,
    FormBuilderComponent,
    FormViewComponent,
    RouterOutlet,
    NgIf,
    AsyncPipe,
    JsonPipe,
    ErrorComponent,
  ],
})
export class AppComponent {
  error$: Observable<AppError | null> = this.errorService.error$;
  constructor(private errorService: ErrorService) {}
  title = 'Clone Forms';
}
