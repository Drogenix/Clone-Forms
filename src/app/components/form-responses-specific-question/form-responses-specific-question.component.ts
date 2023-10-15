import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiDataListWrapperModule, TuiSelectModule } from '@taiga-ui/kit';
import { Form } from '../../core/entity/form';
import {
  TuiDataListModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QuestionResponseGroup } from '../../core/entity/question-response-grouped';
import {
  Observable,
  switchMap,
  tap,
  combineLatest,
  map,
  take,
  merge,
  takeUntil,
  startWith,
  share,
  shareReplay,
} from 'rxjs';
import { FormsResponsesService } from '../../core/services/forms-responses.service';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from '../../core/services/forms.service';
import { PageSpinnerComponent } from '../page-spinner/page-spinner.component';
import { TuiDestroyService } from '@taiga-ui/cdk';

interface SelectItem {
  title: string;
  questionId: number;
}

interface FormResponsesData {
  form: Form;
  responsesGroups: QuestionResponseGroup[];
}

@Component({
  selector: 'app-form-responses-specific-question',
  standalone: true,
  providers: [TuiDestroyService],
  imports: [
    CommonModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiDataListModule,
    TuiDataListWrapperModule,
    PageSpinnerComponent,
  ],
  templateUrl: './form-responses-specific-question.component.html',
  styleUrls: ['./form-responses-specific-question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormResponsesSpecificQuestionComponent implements OnInit {
  selectedQuestion = new FormControl<SelectItem>({} as SelectItem, {
    nonNullable: true,
  });
  selectItems: SelectItem[] = [];
  formResponsesData$: Observable<FormResponsesData>;
  get selectedIndex(): number {
    return this.selectItems.indexOf(this.selectedQuestion.value);
  }
  constructor(
    private formsResponsesService: FormsResponsesService,
    private formService: FormsService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    const formId: string = this.activatedRoute.snapshot.params['id'];

    const form$ = this.activatedRoute.params.pipe(
      switchMap(() => this.formService.getById(formId)),
      tap((form) => {
        form.questions.forEach((question) => {
          const item: SelectItem = {
            title: question.title,
            questionId: question.id,
          };

          this.selectItems.push(item);
        });

        this.selectedQuestion.patchValue(this.selectItems[0]);
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    const onSelectItemsInit$ = form$.pipe(
      map(() => this.selectItems[0]),
      take(1),
    );

    const responseGroups$ = merge(
      this.selectedQuestion.valueChanges,
      onSelectItemsInit$,
    ).pipe(
      switchMap((item) =>
        this.formsResponsesService.getQuestionResponsesGroupBySpecificAnswer(
          formId,
          item.questionId,
        ),
      ),
    );

    this.formResponsesData$ = combineLatest([form$, responseGroups$]).pipe(
      map(([form, responseGroups]) => {
        return {
          form: form,
          responsesGroups: responseGroups,
        };
      }),
    );
  }
}
