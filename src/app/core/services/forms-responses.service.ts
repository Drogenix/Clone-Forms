import { Injectable } from '@angular/core';
import { FormResponseAnswer } from '../entity/form-response-answer';
import { Answer } from '../entity/answer';
import { HttpClient } from '@angular/common/http';
import { QuestionResponseGroup } from '../entity/question-response-grouped';
import { combineLatest, map, Observable } from 'rxjs';
import { API_BASE_URL_2 } from '../../api-url';
import { UuidGenerator } from './uuid-generator.service';
import { FormUserResponse } from '../entity/form-user-response';
import { QuestionResponseInfo } from '../entity/question-response-info';
import { Question } from '../entity/question';
import { QuestionResponseAnswerInfo } from '../entity/question-response-answer-info';
import { FormsService } from './forms.service';
import { FormQuestionResponse } from '../entity/question-response';

@Injectable({
  providedIn: 'root',
})
export class FormsResponsesService {
  constructor(
    private http: HttpClient,
    private uuidGenerator: UuidGenerator,
    private formService: FormsService,
  ) {}

  getQuestionResponsesGroupBySpecificAnswer(
    formId: string,
    questionId: number,
  ): Observable<QuestionResponseGroup[]> {
    return this.http
      .get<
        FormUserResponse[]
      >(`${API_BASE_URL_2}/form-responses?formId=` + formId)
      .pipe(map((responses) => this._groupResponses(responses, questionId)));
  }

  private _groupResponses(
    responses: FormUserResponse[],
    questionId: number,
  ): QuestionResponseGroup[] {
    const questionResponses: FormQuestionResponse[] = [];

    for (let i = 0; i < responses.length; i++) {
      const responseAnswers = responses[i].userAnswers;

      responseAnswers.forEach((answer) => {
        if (answer.questionId === questionId && answer.answers.length > 0)
          questionResponses.push(answer);
      });
    }

    const responseGroups: QuestionResponseGroup[] = [];

    for (let i = 0; i < questionResponses.length; i++) {
      const responseAnswers = questionResponses[i].answers;

      if (this._isContainsAnswerGroup(responseAnswers, responseGroups))
        continue;

      const group: QuestionResponseGroup = {
        questionId: questionId,
        totalRepeats: 1,
        answers: responseAnswers,
      };

      for (let k = 0; k < questionResponses.length; k++) {
        if (k === i) continue;

        const answersToCompare = questionResponses[k].answers;

        if (responseAnswers.length != answersToCompare.length) continue;

        for (let j = 0; j < responseAnswers.length; j++) {
          if (!this._isContainsAnswer(responseAnswers[j], answersToCompare))
            break;

          if (j === responseAnswers.length - 1) {
            group.totalRepeats += 1;
          }
        }
      }

      responseGroups.push(group);
    }
    return responseGroups;
  }

  private _isContainsAnswer(answer: Answer, arr: Answer[]): boolean {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id === answer.id && answer.value === arr[i].value) return true;
    }

    return false;
  }

  private _isContainsAnswerGroup(
    answers: Answer[],
    answersGroups: QuestionResponseGroup[],
  ) {
    if (answersGroups.length === 0) return false;

    for (let i = 0; i < answersGroups.length; i++) {
      const respAnswers = answersGroups[i].answers;

      if (respAnswers.length != answers.length) continue;

      for (let j = 0; j < answers.length; j++) {
        if (!this._isContainsAnswer(answers[j], respAnswers)) break;

        if (j === answers.length - 1) return true;
      }
    }

    return false;
  }

  getFormResponsesSummary(formId: string): Observable<QuestionResponseInfo[]> {
    const form$ = this.formService.getById(formId);
    const formResponses$ = this.http.get<FormUserResponse[]>(
      `${API_BASE_URL_2}/form-responses?formId=` + formId,
    );

    return combineLatest([form$, formResponses$]).pipe(
      map(([form, formResponses]) => {
        const questionResponses: QuestionResponseInfo[] = [];

        for (const question of form.questions) {
          const questionResponsesInfo: QuestionResponseInfo =
            this.getQuestionResponsesInfo(
              question,
              formResponses as FormUserResponse[],
            );

          questionResponses.push(questionResponsesInfo);
        }

        return questionResponses;
      }),
    );
  }

  getQuestionResponsesInfo(
    question: Question,
    responses: FormUserResponse[],
  ): QuestionResponseInfo {
    const questionPossibleAnswers = question.answers.offeredAnswers;

    const responsesAnswers: FormResponseAnswer[] = [];

    responses.forEach((response) => {
      responsesAnswers.push(...response.userAnswers);
    });

    const questionAnswers: Answer[] = [];

    responsesAnswers.forEach((response) => {
      if (response.questionId === question.id)
        questionAnswers.push(...response.answers);
    });

    if (question.answers.anotherAnswer) {
      const anotherAnswerPossibleResponses =
        this._getAnotherAnswerPossibleResponses(
          question.answers.anotherAnswer.id,
          questionAnswers,
        );

      questionPossibleAnswers.push(...anotherAnswerPossibleResponses);
    }

    const questionResponseInfo: QuestionResponseInfo = {
      totalAnswers: questionAnswers.length,
      questionId: question.id,
      questionAnswers: [],
    };

    if (question.questionType.group === 0) {
      for (let i = 0; i < questionAnswers.length; i++) {
        const questionResponseAnswerInfo: QuestionResponseAnswerInfo = {
          answer: questionAnswers[i],
          totalCount: 1,
        };

        questionResponseInfo.questionAnswers.push(questionResponseAnswerInfo);
      }
    } else {
      for (let i = 0; i < questionPossibleAnswers.length; i++) {
        const possibleAnswer = questionPossibleAnswers[i];

        const questionResponseAnswerInfo: QuestionResponseAnswerInfo = {
          answer: possibleAnswer,
          totalCount: 0,
        };

        for (let k = 0; k < questionAnswers.length; k++) {
          if (
            (possibleAnswer.order &&
              possibleAnswer.id === questionAnswers[k].id) ||
            (!possibleAnswer.order &&
              possibleAnswer.value === questionAnswers[k].value)
          )
            questionResponseAnswerInfo.totalCount += 1;
        }

        questionResponseInfo.questionAnswers.push(questionResponseAnswerInfo);
      }
    }

    return questionResponseInfo;
  }

  private _getAnotherAnswerPossibleResponses(
    answerId: number,
    questionAnswers: Answer[],
  ) {
    const possibleResponses: Answer[] = [];

    for (let i = 0; i < questionAnswers.length; i++) {
      const questionResponse = questionAnswers[i];

      if (
        answerId === questionResponse.id &&
        !questionResponse.order &&
        possibleResponses.findIndex(
          (response) => response.value === questionResponse.value,
        ) === -1
      )
        possibleResponses.push(questionResponse);
    }

    return possibleResponses;
  }

  getFormResponses(formId: string): Observable<FormUserResponse[]> {
    return this.http.get<FormUserResponse[]>(
      `${API_BASE_URL_2}/form-responses?formId=` + formId,
    );
  }

  create(formResponse: FormUserResponse): Observable<Object> {
    formResponse.id = this.uuidGenerator.generate();

    return this.http.post(`${API_BASE_URL_2}/form-responses`, formResponse);
  }
}
