import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormViewComponent } from '../../pages/form-view/form-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { FormsService } from '../../core/services/forms.service';
import { FormsResponsesService } from '../../core/services/forms-responses.service';
import { ActivatedRoute } from '@angular/router';
import { Form } from '../../core/entity/form';
import { CounterComponent } from '../counter/counter.component';
import { PageSpinnerComponent } from '../page-spinner/page-spinner.component';
import { FormUserResponse } from '../../core/entity/form-user-response';

interface FormResponsesData {
  form: Form;
  formResponses: FormUserResponse[];
}
@Component({
  selector: 'app-form-responses-specific-user',
  standalone: true,
  imports: [
    CommonModule,
    FormViewComponent,
    ReactiveFormsModule,
    PageSpinnerComponent,
    CounterComponent,
  ],
  templateUrl: './form-responses-specific-user.component.html',
  styleUrls: ['./form-responses-specific-user.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormResponsesSpecificUserComponent implements OnInit {
  activeIndex = 0;
  formResponses$: Observable<FormResponsesData>;
  constructor(
    private formService: FormsService,
    private formResponsesService: FormsResponsesService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    const formId$ = this.activatedRoute.params.pipe(
      map((params) => params['id']),
    );

    const form$ = formId$.pipe(
      switchMap((formId) => this.formService.getById(formId)),
    );

    const formResponses$ = formId$.pipe(
      switchMap((formId) => this.formResponsesService.getFormResponses(formId)),
    );

    this.formResponses$ = combineLatest([form$, formResponses$]).pipe(
      map(([form, formResponses]) => {
        return {
          form: form,
          formResponses: formResponses,
        };
      }),
    );
  }
  onCounterChange(value: number) {
    this.activeIndex = value - 1;
  }
}
