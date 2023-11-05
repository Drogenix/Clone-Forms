import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  delay,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Form } from '../entity/form';
import { UserService } from './user.service';
import { FormDetails } from '../entity/form-details';
import { Question } from '../entity/question';
import { API_BASE_URL } from '../../api-url';
import { QuestionTypeName } from '../enum/question-type-name';
import { UuidGenerator } from './uuid-generator.service';
import { AppError } from '../entity/app-error';
import { FormUserResponse } from '../entity/form-user-response';

const FORM_NOT_FOUND_ERROR: AppError = {
  status: 404,
  message: 'Форма не найдена',
  details:
    'Возможные причины ошибки: указан неверный URL или форма не существует.',
};

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  private _formStateSub = new BehaviorSubject<Form | null>(null);
  private _updatingDataSub = new Subject<boolean>();
  updatingData$: Observable<boolean> = this._updatingDataSub
    .asObservable()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private uuidGenerator: UuidGenerator,
  ) {}

  getUserTrash(
    order: 'asc' | 'desc' = 'asc',
    sortBy: 'deleted' | 'name' = 'name',
    nameLike?: string,
  ): Observable<FormDetails[]> {
    let url = `${API_BASE_URL}/form-details?userId=${this.userService.user?.id}&sortBy=${sortBy}&order=${order}`;
    if (nameLike) url = url.replace('?', `?name=${nameLike}&`);

    return this.http.get<FormDetails[]>(url).pipe(
      map((response) => response.filter((item) => item.inTrash === true)),
      switchMap((response) => {
        if (response.length === 0 && nameLike) {
          const error: AppError = {
            status: 404,
            message: 'Ничего не найдено',
          };

          return throwError(() => error);
        }

        return of(response);
      }),
    );
  }

  getFormDetails(formId: string): Observable<FormDetails> {
    return this.http
      .get<FormUserResponse[]>(
        `${API_BASE_URL}/form-responses?formId=` + formId,
      )
      .pipe(
        switchMap((formResponses) => {
          return this.http
            .get<FormDetails[]>(
              `${API_BASE_URL}/form-details?userId=${this.userService.user?.id}`,
            )
            .pipe(
              switchMap((response) => {
                const filtered = response.filter(
                  (item) => item.formId === formId,
                );

                if (filtered.length === 0)
                  return throwError(() => FORM_NOT_FOUND_ERROR);

                return of(filtered);
              }),
              map((response) => {
                const formDetails = response[0];

                formDetails.totalResponses = formResponses.length;
                return formDetails;
              }),
            );
        }),
      );
  }

  getUserForms(
    order: 'asc' | 'desc' = 'asc',
    sortBy: 'lastUpdate' | 'name' = 'name',
  ): Observable<FormDetails[]> {
    return this.http
      .get<FormDetails[]>(
        `${API_BASE_URL}/form-details?userId=${this.userService.user?.id}&sortBy=${sortBy}&order=${order}`,
      )
      .pipe(
        map((response) => response.filter((item) => item.inTrash === false)),
      );
  }

  findByName(name: string): Observable<FormDetails[]> {
    return this.http
      .get<FormDetails[]>(
        `${API_BASE_URL}/form-details?userId=${this.userService.user?.id}`,
      )
      .pipe(
        map((response) => response.filter((item) => item.name.includes(name))),
        map((response) => response.filter((item) => item.inTrash === false)),
      );
  }

  getById(formId: string): Observable<Form> {
    return this._formStateSub
      .asObservable()
      .pipe(
        switchMap((form) =>
          form && form.id === formId
            ? of(form)
            : this.http
                .get<Form[]>(`${API_BASE_URL}/forms?id=${formId}`)
                .pipe(
                  switchMap((response) =>
                    response[0]
                      ? of(response[0])
                      : throwError(() => FORM_NOT_FOUND_ERROR),
                  ),
                ),
        ),
      );
  }

  getByLink(link: string): Observable<Form> {
    return this.http
      .get<FormDetails[]>(`${API_BASE_URL}/form-details?link=${link}`)
      .pipe(
        switchMap((formDetails) => {
          if (formDetails.length === 0)
            return throwError(() => new Error('Page not found'));

          return this.http
            .get<Form[]>(`${API_BASE_URL}/forms?formId` + formDetails[0].formId)
            .pipe(map((response) => response[0]));
        }),
      );
  }

  saveFormState(form: Form) {
    this._formStateSub.next(form);
  }

  updateForm(form: Form): Observable<Object> {
    this._updatingDataSub.next(true);

    return this.http.put(`${API_BASE_URL}/forms/${form.uid}`, form).pipe(
      switchMap(() =>
        this.http.get<FormDetails[]>(
          `${API_BASE_URL}/form-details?formId=${form.id}`,
        ),
      ),
      switchMap((formDetailsResponse: FormDetails[]) => {
        const formDetails = formDetailsResponse[0];
        formDetails.lastUpdate = new Date();

        return this.http.put(
          `${API_BASE_URL}/form-details/` + formDetails.uid,
          formDetails,
        );
      }),
      tap(() => this._updatingDataSub.next(false)),
    );
  }

  updateFormDetails(formDetails: FormDetails): Observable<Object> {
    formDetails.lastUpdate = new Date();
    this._updatingDataSub.next(true);

    return this.http
      .put(`${API_BASE_URL}/form-details/${formDetails.uid}`, formDetails)
      .pipe(tap(() => this._updatingDataSub.next(false)));
  }

  create(): Observable<Form> {
    const question: Question = {
      id: 0,
      title: 'Вопрос без заголовка',
      questionType: {
        name: QuestionTypeName.OneChoice,
        group: 1,
      },
      answers: {
        offeredAnswers: [
          {
            id: 0,
            value: 'Вариант 1',
            order: 1,
          },
        ],
      },
      order: 1,
      required: false,
    };

    const form: Form = {
      id: this.uuidGenerator.generate(),
      title: 'Новая форма',
      description: '',
      questions: [question],
    };

    return this.http.post<Form>(`${API_BASE_URL}/forms`, form).pipe(
      switchMap((newForm) => {
        const formDetails: FormDetails = {
          id: this.uuidGenerator.generate(),
          userId: this.userService.user!.id,
          formId: newForm.id,
          link: this.uuidGenerator.generate(),
          name: 'Новая форма',
          totalResponses: 0,
          acceptResponses: true,
          inTrash: false,
          lastUpdate: new Date(),
        };

        return this.http
          .post(`${API_BASE_URL}/form-details`, formDetails)
          .pipe(map(() => newForm));
      }),
    );
  }
}
