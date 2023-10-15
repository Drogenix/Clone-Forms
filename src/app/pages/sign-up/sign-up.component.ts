import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { userExistsValidator } from '../../core/validators/user-exists.validator';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import { Router, RouterLink } from '@angular/router';
import { AuthUser } from '../../core/entity/auth-user';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SpinnerComponent],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpComponent implements OnInit {
  signUpForm = this.fb.nonNullable.group({
    login: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(24),
        ],
        asyncValidators: [userExistsValidator(this.userService)],
      },
    ],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(30)],
    ],
  });
  showPass = false;
  private _loadSub = new Subject<boolean>();
  load$ = this._loadSub.asObservable();
  private _errorSub = new BehaviorSubject<string>('');
  error$ = this._errorSub.asObservable();
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.signUpForm.statusChanges.subscribe(() => this.cdr.markForCheck());
  }
  submit() {
    if (this.signUpForm.valid) {
      const user = this.signUpForm.value as AuthUser;

      this._loadSub.next(true);
      this._errorSub.next('');

      this.userService.signUp(user).subscribe({
        next: () => this.router.navigateByUrl(''),
        error: (err) => {
          debugger;
          this._errorSub.next(err);
          this._loadSub.next(false);
        },
      });
    } else {
      this.signUpForm.markAllAsTouched();
    }
  }
}
