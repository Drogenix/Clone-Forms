import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BehaviorSubject,
  of,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { UserService } from '../../core/services/user.service';
import { AuthUser } from '../../core/entity/auth-user';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Router, RouterLink } from '@angular/router';
import { TuiHintModule } from '@taiga-ui/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    TuiHintModule,
  ],
  providers: [TuiDestroyService],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      transition(
        ':enter',
        [
          style({
            position: 'relative',
            left: '150%',
          }),
          animate(
            '300ms',
            keyframes([
              style({
                left: 0,
                offset: 1,
              }),
            ]),
          ),
        ],
        {},
      ),
      transition(':leave', [
        style({
          position: 'absolute',
          width: '100%',
          pointerEvents: 'none',
          top: 0,
          right: 0,
        }),
        animate(
          '300ms',
          style({
            right: '150%',
          }),
        ),
      ]),
    ]),
  ],
})
export class SignInComponent implements AfterViewInit {
  loginForm = this.fb.nonNullable.group({
    login: ['', Validators.required],
    password: ['', Validators.required],
  });

  private _step = 0;
  get step(): number {
    return this._step;
  }
  showPass = false;
  animationDisabled = true;

  private _errorSub = new BehaviorSubject<string>('');
  error$ = this._errorSub.asObservable();

  private _loadSub = new Subject<boolean>();
  load$ = this._loadSub.asObservable();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private destroy$: TuiDestroyService,
    private router: Router,
  ) {}

  ngAfterViewInit(): void {
    this.animationDisabled = false;
  }

  checkLogin() {
    if (this.loginForm.controls.login.valid) {
      this._loadSub.next(true);
      this._errorSub.next('');

      this.userService
        .userExists(this.loginForm.controls.login.value)
        .pipe(
          switchMap((exists) => {
            if (!exists)
              return throwError(() => 'Такого пользователя не существует');

            return of(exists);
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: () => {
            this._loadSub.next(false);
            this._step += 1;
          },
          error: (err) => {
            this._errorSub.next(err);
            this._loadSub.next(false);
          },
        });
    } else {
      this.loginForm.controls.login.markAsDirty();
    }
  }

  previousStep() {
    this._step = this._step === 0 ? 0 : (this._step -= 1);

    this._errorSub.next('');
  }

  submit() {
    if (this.loginForm.valid) {
      const user = this.loginForm.value as AuthUser;

      this._loadSub.next(true);
      this._errorSub.next('');

      this.userService
        .signIn(user)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => this.router.navigateByUrl(''),
          error: (err) => {
            this._errorSub.next(err);
            this._loadSub.next(false);
          },
        });
    } else {
      this.loginForm.controls.password.markAsDirty();
    }
  }
}
