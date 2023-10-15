import {
  ActivatedRouteSnapshot,
  createUrlTreeFromSnapshot,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { FormEditComponent } from './pages/form-edit/form-edit.component';
import { FormResponsesComponent } from './pages/form-responses/form-responses.component';
import { FormBuilderComponent } from './pages/form-builder/form-builder.component';
import { FormResponsesSummaryComponent } from './components/form-responses-summary/form-responses-summary.component';
import { FormResponsesSpecificQuestionComponent } from './components/form-responses-specific-question/form-responses-specific-question.component';
import { FormResponsesSpecificUserComponent } from './components/form-responses-specific-user/form-responses-specific-user.component';
import { FormViewComponent } from './pages/form-view/form-view.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { inject } from '@angular/core';
import { UserService } from './core/services/user.service';
import { map } from 'rxjs';
import { TrashComponent } from './pages/trash/trash.component';
import { ErrorComponent } from './components/error/error.component';

const FORM_RESPONSES_ROUTES: Routes = [
  {
    path: '',
    component: FormResponsesSummaryComponent,
    pathMatch: 'full',
  },
  {
    path: 'questions',
    component: FormResponsesSpecificQuestionComponent,
  },
  {
    path: 'users',
    component: FormResponsesSpecificUserComponent,
  },
];

const AUTHORIZED_GUARD =
  (shouldBeAuthorized: boolean, redirectUrl: 'sign-in' | '') =>
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const userService = inject(UserService);

    return userService.authorized$.pipe(
      map((value) => {
        return value === shouldBeAuthorized
          ? true
          : createUrlTreeFromSnapshot(route.root, [redirectUrl]);
      }),
    );
  };

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [AUTHORIZED_GUARD(true, 'sign-in')],
  },
  {
    path: 'sign-up',
    component: SignUpComponent,
    canActivate: [AUTHORIZED_GUARD(false, '')],
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [AUTHORIZED_GUARD(false, '')],
  },
  {
    path: 'trash',
    canActivate: [AUTHORIZED_GUARD(true, 'sign-in')],
    component: TrashComponent,
  },
  {
    path: 'form/:id/view',
    component: FormViewComponent,
    canActivate: [AUTHORIZED_GUARD(true, 'sign-in')],
  },
  {
    path: 'form/:id',
    component: FormEditComponent,
    canActivate: [AUTHORIZED_GUARD(true, 'sign-in')],
    children: [
      {
        path: 'edit',
        component: FormBuilderComponent,
      },
      {
        path: 'responses',
        component: FormResponsesComponent,
        children: FORM_RESPONSES_ROUTES,
      },
    ],
  },
  {
    path: ':link',
    component: FormViewComponent,
  },
  {
    path: '**',
    component: ErrorComponent,
  },
];
