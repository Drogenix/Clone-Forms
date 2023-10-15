import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiToggleModule } from '@taiga-ui/kit';
import {
  ActivatedRoute,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { FormsService } from '../../core/services/forms.service';
import {
  combineLatest,
  Observable,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { FormDetails } from '../../core/entity/form-details';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormatResponsesTotalPipe } from '../../core/pipes/format-responses-total.pipe';
import { TextInputComponent } from '../../components/text-input/text-input.component';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-form-responses',
  standalone: true,
  imports: [
    CommonModule,
    TuiToggleModule,
    RouterLinkActive,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    FormatResponsesTotalPipe,
    TextInputComponent,
  ],
  providers: [TuiDestroyService],
  templateUrl: './form-responses.component.html',
  styleUrls: ['./form-responses.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormResponsesComponent implements OnInit {
  formDetails$: Observable<FormDetails> = this.activatedRoute.params.pipe(
    switchMap((params) => {
      const formId = params['id'];

      return this.formService.getFormDetails(formId);
    }),
    tap((formDetails) => {
      this.acceptResponses.setValue(formDetails.acceptResponses, {
        emitEvent: false,
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  acceptResponses = new FormControl<boolean>(false, { nonNullable: true });
  readonly DEFAULT_FORM_CLOSED_MESSAGE =
    'Эта форма закрыта. Ответы больше не принимаются';
  constructor(
    private formService: FormsService,
    private destroy$: TuiDestroyService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const acceptResponses$: Observable<boolean> =
      this.acceptResponses.valueChanges;

    combineLatest([acceptResponses$, this.formDetails$])
      .pipe(
        switchMap(([acceptResponses, formDetails]) => {
          formDetails.acceptResponses = acceptResponses!;
          return this.formService.updateFormDetails(formDetails as FormDetails);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
  onMessageChanged(message: string) {
    this.formDetails$
      .pipe(
        switchMap((formDetails) => {
          formDetails.formClosedMessage = message;
          return this.formService.updateFormDetails(formDetails);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
}
