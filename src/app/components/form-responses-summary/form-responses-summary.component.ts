import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiAxesModule,
  TuiBarModule,
  TuiBarSetModule,
  TuiPieChartModule,
} from '@taiga-ui/addon-charts';
import { TuiHintModule } from '@taiga-ui/core';
import { Form } from '../../core/entity/form';
import { BarsSetComponent } from '../bars-set/bars-set.component';
import { PieChartComponent } from '../pie-chart/pie-chart.component';
import { FormsService } from '../../core/services/forms.service';
import { ActivatedRoute } from '@angular/router';
import { QuestionResponseInfo } from '../../core/entity/question-response-info';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { FormatResponsesTotalPipe } from '../../core/pipes/format-responses-total.pipe';
import { PageSpinnerComponent } from '../page-spinner/page-spinner.component';
import { FormsResponsesService } from '../../core/services/forms-responses.service';

interface FormResponseData {
  form: Form;
  questionsResponsesInfo: QuestionResponseInfo[];
}

@Component({
  selector: 'app-form-responses-summary',
  standalone: true,
  imports: [
    CommonModule,
    TuiPieChartModule,
    TuiBarSetModule,
    TuiHintModule,
    TuiAxesModule,
    TuiBarModule,
    BarsSetComponent,
    PieChartComponent,
    FormatResponsesTotalPipe,
    PageSpinnerComponent,
  ],
  templateUrl: './form-responses-summary.component.html',
  styleUrls: ['./form-responses-summary.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormResponsesSummaryComponent implements OnInit {
  formResponsesData: Observable<FormResponseData>;
  constructor(
    private formsService: FormsService,
    private formResponsesService: FormsResponsesService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const formId$ = this.activatedRoute.params.pipe(
      map((params) => params['id']),
    );

    const form$ = formId$.pipe(
      switchMap((formId) => this.formsService.getById(formId)),
    );

    const questionsResponsesInfo$ = formId$.pipe(
      switchMap((formId) =>
        this.formResponsesService.getFormResponsesSummary(formId),
      ),
    );

    this.formResponsesData = combineLatest([
      form$,
      questionsResponsesInfo$,
    ]).pipe(
      map(([form, questionsResponsesInfo]) => {
        return {
          form: form,
          questionsResponsesInfo: questionsResponsesInfo,
        };
      }),
    );
  }

  getAnswersText(questionResponseInfo: QuestionResponseInfo): string[] {
    const answersText: string[] = [];

    for (const questionAnswer of questionResponseInfo.questionAnswers) {
      answersText.push(questionAnswer.answer.value);
    }

    return answersText;
  }

  getAnswersTotalRepeats(questionResponseInfo: QuestionResponseInfo): number[] {
    const answersTotalRepeats: number[] = [];

    for (const questionAnswer of questionResponseInfo.questionAnswers) {
      answersTotalRepeats.push(questionAnswer.totalCount);
    }

    return answersTotalRepeats;
  }
}
