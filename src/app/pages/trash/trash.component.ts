import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { TuiAlertService, TuiDropdownModule } from '@taiga-ui/core';
import { PageSpinnerComponent } from '../../components/page-spinner/page-spinner.component';
import { FormsService } from '../../core/services/forms.service';
import { LastUpdateDatePipe } from '../../core/pipes/last-update-date.pipe';
import { TuiActiveZoneModule, TuiDestroyService } from '@taiga-ui/cdk';
import { FormDetails } from '../../core/entity/form-details';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { AlertComponent } from '../../components/alert/alert.component';

interface SortOption {
  name: string;
  sortBy: 'name' | 'deleted';
  order: 'asc' | 'desc';
}
@Component({
  selector: 'app-trash',
  standalone: true,
  providers: [TuiDestroyService],
  imports: [
    CommonModule,
    HeaderComponent,
    TuiDropdownModule,
    ReactiveFormsModule,
    PageSpinnerComponent,
    LastUpdateDatePipe,
    TuiActiveZoneModule,
  ],
  templateUrl: './trash.component.html',
  styleUrls: ['./trash.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrashComponent implements OnInit {
  readonly sortOptions: SortOption[] = [
    {
      name: 'По названию',
      sortBy: 'name',
      order: 'asc',
    },
    {
      name: 'По дате удаления',
      sortBy: 'deleted',
      order: 'desc',
    },
  ];
  selectedSortOption = 0;
  openSortOptions = false;
  activeForm = NaN;
  openFormMenu = false;
  searchInput = new FormControl('', { nonNullable: true });
  private _notFoundSub = new BehaviorSubject<boolean>(false);
  notFound$ = this._notFoundSub.asObservable();
  private _formsSub = new BehaviorSubject<null>(null);
  forms$ = this._formsSub.asObservable().pipe(
    switchMap(() =>
      this.formService
        .getUserTrash(
          this.sortOptions[this.selectedSortOption].order,
          this.sortOptions[this.selectedSortOption].sortBy,
          this.searchInput.value,
        )
        .pipe(
          startWith(null),
          catchError((error) => {
            if (error.status === 404 && this.searchInput.value) {
              this._notFoundSub.next(true);
            }

            return of([] as FormDetails[]);
          }),
        ),
    ),
  );

  constructor(
    private alertService: TuiAlertService,
    private formService: FormsService,
    private cdr: ChangeDetectorRef,
    private destroy$: TuiDestroyService,
  ) {}

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this._notFoundSub.next(false);

        this._formsSub.next(null);
      });
  }

  changeSortOption(index: number) {
    if (this.selectedSortOption != index) {
      this.selectedSortOption = index;
      this.openSortOptions = false;

      this._formsSub.next(null);

      this.cdr.markForCheck();
    }
  }

  openMenu(event: MouseEvent, index: number) {
    event.stopPropagation();

    this.activeForm = index;
    this.openFormMenu = true;
  }

  onFormActiveZoneChange(active: any) {
    this.openFormMenu = active && this.openFormMenu;

    if (active === false) this.activeForm = NaN;
  }

  moveFromTrash(index: number, forms: FormDetails[]) {
    this.activeForm = NaN;

    const formToMove = forms[index];
    formToMove.inTrash = false;

    forms.splice(index, 1);
    this.cdr.markForCheck();

    const formNameShort = formToMove.name.slice(0, 12) + '...';

    this.formService
      .updateFormDetails(formToMove)
      .pipe(
        switchMap(() =>
          this.alertService.open<boolean>(
            new PolymorpheusComponent(AlertComponent),
            {
              autoClose: 3000,
              hasCloseButton: false,
              data: `Объект "${formNameShort}" восстановлен`,
              status: 'warning',
            },
          ),
        ),
        switchMap((cancelMove) => {
          if (cancelMove) {
            forms = forms.splice(index, 0, formToMove);
            this.cdr.markForCheck();

            formToMove.inTrash = true;
            return this.formService.updateFormDetails(formToMove);
          }

          return of(cancelMove);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
}
