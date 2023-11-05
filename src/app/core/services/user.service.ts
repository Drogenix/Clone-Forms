import { Injectable } from '@angular/core';
import { User } from '../entity/user';
import { HttpClient } from '@angular/common/http';
import { AuthUser } from '../entity/auth-user';
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { API_BASE_URL } from '../../api-url';
import { faker } from '@faker-js/faker';
import { LocalStorageService } from './local-storage.service';
import { AppError } from '../entity/app-error';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly storageKey = 'clone-ut';
  user: User | undefined;
  private _authorizedSub = new BehaviorSubject<boolean>(false);
  authorized$ = this._authorizedSub.asObservable();

  constructor(
    private http: HttpClient,
    private storage: LocalStorageService,
  ) {}

  private _generateUuid(): string {
    return faker.string.uuid();
  }

  private _setAuth(user: User) {
    this.user = {
      login: user.login,
      id: user.id,
    };
    this._authorizedSub.next(true);
    this.storage.set(this.storageKey, JSON.stringify(user));
  }

  checkAuth(): Observable<Object> {
    const token = this.storage.get(this.storageKey);
    if (token) {
      const user = JSON.parse(token) as User;
      return this.http.get(`${API_BASE_URL}/users?id=${user.id}`).pipe(
        catchError((err: AppError) => {
          if (err.status === 404) {
            this.storage.remove(this.storageKey);
            this._authorizedSub.next(false);
          }

          return EMPTY;
        }),
        tap(() => {
          this.user = user;
          this._authorizedSub.next(true);
        }),
      );
    }

    return EMPTY;
  }

  userExists(login: string): Observable<boolean> {
    return this.http.get(`${API_BASE_URL}/users?login=${login}`).pipe(
      map((response) => {
        return !(Array.isArray(response) && response.length === 0);
      }),
    );
  }

  signIn(user: AuthUser): Observable<User> {
    return this.http
      .get<AuthUser[]>(
        `${API_BASE_URL}/users?login=${user.login}&password=${user.password}`,
      )
      .pipe(
        map((response) =>
          response.filter(
            (item) =>
              item.login === user.login && item.password === user.password,
          ),
        ),
        switchMap((users: User[]) => {
          if (users.length === 0) return throwError(() => 'Неверный пароль');

          return of(users[0]);
        }),
        tap((user) => this._setAuth(user)),
      );
  }

  signUp(user: AuthUser): Observable<User> {
    user.id = this._generateUuid();

    return this.http
      .post<User>(`${API_BASE_URL}/users`, user)
      .pipe(tap((user) => this._setAuth(user)));
  }

  logout() {
    this.storage.remove(this.storageKey);
    this.user = undefined;
    this._authorizedSub.next(false);
  }
}
