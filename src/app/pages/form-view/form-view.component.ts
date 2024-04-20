import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, NgSwitch } from '@angular/common';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Form } from '../../core/entity/form';
import { FormViewQuestionComponent } from '../../components/form-view-question/form-view-question.component';
import { FormQuestionResponse } from '../../core/entity/question-response';
import { questionRequiredValidator } from '../../core/validators/question-required.validator';
import { Question } from '../../core/entity/question';
import { FormsService } from '../../core/services/forms.service';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormDetails } from '../../core/entity/form-details';
import { PageSpinnerComponent } from '../../components/page-spinner/page-spinner.component';
import { FormsResponsesService } from '../../core/services/forms-responses.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { FormUserResponse } from '../../core/entity/form-user-response';
import { ErrorComponent } from '../../components/error/error.component';
import { AppError } from '../../core/entity/app-error';

interface FormViewData {
  form: Form;
  details: FormDetails | null;
}
@Component({
  selector: 'app-form-view',
  standalone: true,
  imports: [
    CommonModule,
    NgSwitch,
    TextInputComponent,
    ReactiveFormsModule,
    FormViewQuestionComponent,
    PageSpinnerComponent,
    ErrorComponent,
  ],
  providers: [TuiDestroyService, FormsService],
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormViewComponent implements OnInit, OnChanges {
  @Input() editable = true;
  @Input() viewForm: Form;
  @Input() formResponse: FormUserResponse;
  readonly DEFAULT_FORM_CLOSED_MESSAGE =
    'Эта форма закрыта. Ответы больше не принимаются';
  responses = this.fb.array<FormControl<FormQuestionResponse>>([]);
  private _responseSavedSub = new BehaviorSubject<boolean>(false);
  responseSaved$ = this._responseSavedSub.asObservable();
  private _errorSub = new Subject<AppError | null>();
  error$ = this._errorSub.asObservable();
  formData$: Observable<FormViewData>;
  private formId = '';

  constructor(
    private fb: FormBuilder,
    private formService: FormsService,
    private destroy$: TuiDestroyService,
    private formResponseService: FormsResponsesService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    if (this.viewForm) {
      this.formData$ = of({
        form: this.viewForm,
        details: null,
      });
      this._updateQuestions(this.viewForm);
    }

    const form$ = this.activatedRoute.params.pipe(
      switchMap((params) => {
        const formId = params['id'];
        if (formId) return this.formService.getById(formId);

        const link = params['link'];
        if (link) return this.formService.getByLink(link);

        return throwError(() => 'Page not found');
      }),
      tap((form) => {
        this._updateQuestions(form);
        this.formId = form.id;
      }),
    );

    const formDetails$ = form$.pipe(
      switchMap((form) => this.formService.getFormDetails(form.id)),
    );

    this.formData$ = combineLatest([form$, formDetails$]).pipe(
      tap({
        error: (err) => {
          this._errorSub.next(err);
        },
      }),
      map(([form, details]) => {
        return {
          form: form,
          details: details,
        };
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formResponse']) {
      this._updateQuestions(this.viewForm);
    }
  }

  private _updateQuestions(viewForm: Form) {
    if (this.responses.length > 0) this.responses.clear();

    for (let i = 0; i < viewForm.questions.length; i++) {
      const question = viewForm.questions[i];

      const questionResponse =
        this.fb.nonNullable.control<FormQuestionResponse>(
          this._getResponseDefault(question),
        );

      if (question.required && this.editable) {
        questionResponse.setValidators(questionRequiredValidator());
      }

      if (this.formResponse && this.formResponse.userAnswers[i]) {
        questionResponse.defaultValue.answers =
          this.formResponse.userAnswers[i].answers;
      }

      this.responses.push(questionResponse);
    }
  }

  private _getResponseDefault(question: Question): FormQuestionResponse {
    return {
      id: this.responses.length,
      questionId: question.id,
      required: question.required,
      answers: [],
    };
  }

  saveResponse() {
    if (this.responses.valid) {
      const userResponse: FormUserResponse = {
        id: '',
        formId: this.formId,
        userAnswers: this.responses.value,
      };

      this.formResponseService
        .create(userResponse)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this._responseSavedSub.next(true));
    } else {
      this.responses.markAllAsTouched();
    }
  }

  clearUserResponse(form: Form) {
    for (let i = 0; i < this.responses.controls.length; i++) {
      const question = form.questions[i];

      this.responses.controls[i].reset(this._getResponseDefault(question));
    }
  }
}
