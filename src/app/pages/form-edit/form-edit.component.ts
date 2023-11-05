import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsService } from '../../core/services/forms.service';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  Observable,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiDialogService,
  TuiHintModule,
  tuiSlideInBottom,
} from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { SendFormDialogComponent } from '../../components/send-form-dialog/send-form-dialog.component';
import { FormDetails } from '../../core/entity/form-details';
import { ErrorComponent } from '../../components/error/error.component';
import { AppError } from '../../core/entity/app-error';

@Component({
  selector: 'app-form-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
    TuiHintModule,
    ErrorComponent,
  ],
  providers: [TuiDestroyService, FormsService],
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.css'],
  animations: [tuiSlideInBottom],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormEditComponent implements OnInit {
  formName = new FormControl('', {
    validators: [Validators.required, Validators.maxLength(150)],
    nonNullable: true,
    updateOn: 'blur',
  });
  formId: string;
  private _showStateSub = new BehaviorSubject<boolean>(false);
  private _showStateTimeout: any = undefined;

  private _notFoundSub = new Subject<AppError>();
  notFound$ = this._notFoundSub.asObservable();
  showState$ = this._showStateSub.asObservable();
  updating$ = this.formService.updatingData$.pipe(
    tap(() => this._showStateSub.next(true)),
    map((updating) => {
      if (updating === false) {
        this._showStateTimeout = setTimeout(
          () => this._showStateSub.next(false),
          2000,
        );
      } else if (updating === true && this._showStateTimeout) {
        clearTimeout(this._showStateTimeout);
        this._showStateTimeout = NaN;
      }

      return { updating: updating };
    }),
  );
  formDetails$: Observable<FormDetails> = this.activatedRoute.params.pipe(
    switchMap((params) => {
      this.formId = params['id'];
      return this.formService.getFormDetails(this.formId);
    }),
    tap({
      next: (details) =>
        this.formName.setValue(details.name, { emitEvent: false }),
      error: (err: AppError) => {
        if (err.status === 404) {
          this._notFoundSub.next(err);
        }
      },
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
  constructor(
    private formService: FormsService,
    private activatedRoute: ActivatedRoute,
    private dialogService: TuiDialogService,
    private injector: Injector,
    private destroy$: TuiDestroyService,
    private alertService: TuiAlertService,
  ) {}

  ngOnInit(): void {
    const formName$ = this.formName.valueChanges.pipe(distinctUntilChanged());

    combineLatest([this.formDetails$, formName$])
      .pipe(
        switchMap(([formDetails, formName]) => {
          formDetails.name = formName;
          return this.formService.updateFormDetails(formDetails as FormDetails);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  openSendFormDialog() {
    this.formDetails$
      .pipe(
        switchMap((formDetails) => {
          return this.dialogService.open(
            new PolymorpheusComponent(SendFormDialogComponent, this.injector),
            {
              closeable: false,
              size: 'm',
              dismissible: false,
              data: {
                link: formDetails.link,
              },
            },
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  notifyFeatureInDev() {
    this.alertService
      .open('Эта функция в разработке', {
        autoClose: 3000,
        hasCloseButton: false,
        status: 'info',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
}
