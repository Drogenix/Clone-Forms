import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FormsService } from '../../core/services/forms.service';
import { Router, RouterLink } from '@angular/router';
import {
  TuiAlertService,
  TuiButtonModule,
  TuiDialogService,
  TuiDropdownModule,
  TuiHintModule,
  TuiTooltipModule,
} from '@taiga-ui/core';
import { TuiActiveZoneModule, TuiDestroyService } from '@taiga-ui/cdk';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  Observable,
  of,
  shareReplay,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RenameFormDialogComponent } from '../../components/rename-form-dialog/rename-form-dialog.component';
import { DeleteFormDialogComponent } from '../../components/delete-form-dialog/delete-form-dialog.component';
import { DisableAnimationDirective } from '../../core/directives/disable-animation.directive';
import { PageSpinnerComponent } from '../../components/page-spinner/page-spinner.component';
import { FormDetails } from '../../core/entity/form-details';
import { TooltipDirective } from '../../core/directives/tooltip.directive';
import { LastUpdateDatePipe } from '../../core/pipes/last-update-date.pipe';

interface SortOption {
  name: string;
  sortBy: 'name' | 'lastUpdate';
  order: 'asc' | 'desc';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    PageSpinnerComponent,
    RouterLink,
    TuiDropdownModule,
    TuiActiveZoneModule,
    TuiButtonModule,
    DisableAnimationDirective,
    TuiTooltipModule,
    TuiHintModule,
    TooltipDirective,
    LastUpdateDatePipe,
  ],
  providers: [TuiDestroyService, FormsService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  @ViewChild('searchInput', { static: true })
  private _searchInput: ElementRef<HTMLInputElement>;
  readonly sortOptions: SortOption[] = [
    {
      name: 'По названию',
      sortBy: 'name',
      order: 'asc',
    },
    {
      name: 'По дате изменений',
      sortBy: 'lastUpdate',
      order: 'desc',
    },
  ];
  selectedSortOption = 0;
  openFormMenu = false;
  showSortOptions = false;
  showSearchResult = false;
  searchFocused = false;
  activeMenuIndex = NaN;
  searchResult$: Observable<FormDetails[]>;
  forms$ = this.formsService.getUserForms();
  private _showLoadSub = new Subject<boolean>();
  loading$: Observable<boolean> = this._showLoadSub.asObservable();
  constructor(
    private formsService: FormsService,
    private router: Router,
    private destroy$: TuiDestroyService,
    private readonly dialogService: TuiDialogService,
    private alertService: TuiAlertService,
    private cdr: ChangeDetectorRef,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    const searchInput$ = fromEvent<InputEvent>(
      this._searchInput.nativeElement,
      'input',
    ).pipe(
      map(() => this._searchInput.nativeElement.value),
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    searchInput$.subscribe({
      next: (value) => {
        this.showSearchResult = !!value;
        this.cdr.markForCheck();
      },
    });

    this.searchResult$ = searchInput$.pipe(
      switchMap((value) => this.formsService.findByName(value)),
      catchError(() => of([])),
    );
  }
  openMenu(event: MouseEvent, index: number) {
    event.stopPropagation();

    this.activeMenuIndex = index;
    this.openFormMenu = true;
  }

  onSearchActiveZoneChange(active: boolean) {
    this.showSearchResult = active;
    this.searchFocused = active;
  }

  onActiveZone(active: any) {
    this.openFormMenu = active && this.openFormMenu;

    if (active === false) this.activeMenuIndex = NaN;
  }

  openRenameDialog(formDetails: FormDetails) {
    this.dialogService
      .open<string | boolean>(
        new PolymorpheusComponent(RenameFormDialogComponent, this.injector),
        {
          size: 's',
          closeable: false,
          dismissible: true,
          data: formDetails.name,
        },
      )
      .pipe(
        switchMap((value) => {
          if (typeof value === 'string' && value != formDetails.name) {
            formDetails.name = value;
            return this.formsService.updateFormDetails(formDetails).pipe(
              switchMap(() => {
                this.cdr.markForCheck();
                return this.alertService.open('Форма переименована', {
                  autoClose: 3000,
                  hasCloseButton: false,
                  status: 'info',
                });
              }),
            );
          }

          return of(value);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  openDeleteDialog(formsDetails: FormDetails[], selected: number) {
    this.dialogService
      .open<boolean>(
        new PolymorpheusComponent(DeleteFormDialogComponent, this.injector),
        {
          size: 'm',
          closeable: false,
          dismissible: false,
          data: formsDetails[selected].name,
        },
      )
      .pipe(
        switchMap((deleteForm) => {
          if (deleteForm) {
            const formDetail = formsDetails[selected];
            formDetail.inTrash = true;
            formDetail.deleted = new Date();

            return this.formsService.updateFormDetails(formDetail).pipe(
              switchMap(() => {
                formsDetails.splice(selected, 1);
                this.cdr.markForCheck();
                return this.alertService.open('Форма перемещена в корзину', {
                  autoClose: 3000,
                  hasCloseButton: false,
                  status: 'info',
                });
              }),
            );
          }

          return of(deleteForm);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  changeSortOption(index: number) {
    if (this.selectedSortOption != index) {
      this.selectedSortOption = index;
      this.showSortOptions = false;

      this.forms$ = this.formsService.getUserForms(
        this.sortOptions[index].order,
        this.sortOptions[index].sortBy,
      );

      this.cdr.markForCheck();
    }
  }

  createNewForm() {
    this._showLoadSub.next(true);
    this.formsService
      .create()
      .subscribe((form) => this.router.navigate(['form', form.id, 'edit']));
  }
}
