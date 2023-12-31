import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { FormQuestionComponent } from '../../components/form-question/form-question.component';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { QuestionTypeName } from '../../core/enum/question-type-name';
import { Question } from '../../core/entity/question';
import { QuestionTypeGroup } from '../../core/enum/question-type-group';
import { FormBuilderMenuComponent } from '../../components/form-builder-menu/form-builder-menu.component';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { CdkScrollable } from '@angular/cdk/overlay';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable, switchMap, takeUntil, tap } from 'rxjs';
import { AlertComponent } from '../../components/alert/alert.component';
import { Form } from '../../core/entity/form';
import { ActivatedRoute } from '@angular/router';
import { FormsService } from '../../core/services/forms.service';
import { TextRichEditorComponent } from '../../components/text-rich-editor/text-rich-editor.component';
import { PageSpinnerComponent } from '../../components/page-spinner/page-spinner.component';
import { ErrorComponent } from '../../components/error/error.component';

const QUESTIONS_MAX = 100;

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormQuestionComponent,
    ReactiveFormsModule,
    FormBuilderMenuComponent,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    CdkDragHandle,
    CdkScrollable,
    PageSpinnerComponent,
    TextRichEditorComponent,
    CdkDragPreview,
    ErrorComponent,
  ],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
})
export class FormBuilderComponent implements OnInit, OnDestroy {
  @ViewChild('main', { static: true }) mainRef: ElementRef<HTMLDivElement>;
  @ViewChild('formCont') formRef: ElementRef;
  readonly DESCRIPTION_BLOCK_INDEX = -1;
  form = this.fb.group({
    uid: '0',
    id: '0',
    title: 'Новая форма',
    description: '',
    questions: this.fb.array<FormControl<Question>>([]),
  });
  selected: number = 0;
  get questions() {
    return this.form.controls.questions;
  }
  formData$: Observable<Form>;

  constructor(
    private fb: FormBuilder,
    private alertService: TuiAlertService,
    private destroy$: TuiDestroyService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private viewRef: ViewContainerRef,
    private formService: FormsService,
    private zone: NgZone,
    private readonly injector: Injector,
  ) {}

  ngOnInit(): void {
    this.formData$ = this.route.params.pipe(
      switchMap((params) => {
        const formId = params['id'];
        return this.formService.getById(formId);
      }),
      tap({
        next: (form: Form) => {
          for (const question of form.questions) {
            this.addQuestion(false);
          }

          this.form.controls.questions.patchValue(form.questions, {
            emitEvent: false,
          });

          this.form.patchValue(
            {
              uid: form.uid,
              id: form.id,
              title: form.title,
              description: form.description,
            },
            { emitEvent: false },
          );

          this.setBlockAsSelected(-1);
        },
      }),
    );

    this.form.valueChanges
      .pipe(
        switchMap((value) => this.formService.updateForm(value as Form)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.formService.saveFormState(this.form.value as Form);
  }

  private _notifyDelete(index: number, deletedQuestion: FormControl<Question>) {
    this.alertService
      .open<boolean>(new PolymorpheusComponent(AlertComponent, this.injector), {
        autoClose: 3000,
        hasCloseButton: false,
        status: 'warning',
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((cancelDelete) => {
        if (cancelDelete) {
          this.questions.insert(index, deletedQuestion);
          this.cdr.markForCheck();
        }
      });
  }

  private _changeItemOrder(previousIndex: number, currentIndex: number) {
    const draggedItem = this.questions.controls[previousIndex].value;

    const movedItem = this.questions.controls[currentIndex].value;

    const oldOrder = draggedItem.order;

    draggedItem.order = movedItem.order;
    movedItem.order = oldOrder;

    moveItemInArray(this.questions.controls, previousIndex, currentIndex);

    this.questions.updateValueAndValidity();

    this.setBlockAsSelected(currentIndex);
  }

  setBlockAsSelected(index: number) {
    this.selected = index;
  }

  addQuestion(emitEvent: boolean) {
    if (this.questions.length === QUESTIONS_MAX) return;

    const questionControl = this.fb.nonNullable.control<Question>({
      id: this.questions.length + 1,
      title: 'Вопрос без заголовка',
      questionType: {
        name: QuestionTypeName.OneChoice,
        group: QuestionTypeGroup.List,
      },
      answers: {
        offeredAnswers: [
          {
            id: 0,
            value: 'Вариант 1',
            order: 1,
          },
        ],
        anotherAnswer: undefined,
      },
      order: this.questions.length + 1,
      required: false,
    });

    this.questions.push(questionControl, { emitEvent });

    this.selected = this.questions.length - 1;
  }

  deleteQuestion(index: number) {
    if (this.questions.controls.length != 1) {
      const deletedQuestion = this.questions.at(index);

      this.questions.removeAt(index);

      const newSelectedBlock = index === 0 ? 0 : index - 1;

      this.setBlockAsSelected(newSelectedBlock);

      this._notifyDelete(index, deletedQuestion);
    }
  }

  copyQuestion(index: number) {
    if (this.questions.length === QUESTIONS_MAX) return;

    const questionToCopy = this.questions.controls[index];

    const copiedQuestion: Question = JSON.parse(
      JSON.stringify(questionToCopy.value),
    );
    copiedQuestion.id = this.questions.length + 1;

    const copiedQuestionControl =
      this.fb.nonNullable.control<Question>(copiedQuestion);

    this.questions.controls.push(copiedQuestionControl);

    this.setBlockAsSelected(this.questions.length - 1);
  }

  onQuestionDrop(event: CdkDragDrop<any>) {
    if (event.previousIndex != event.currentIndex) {
      this._changeItemOrder(event.previousIndex, event.currentIndex);
    }
  }

  canSort(index: number, drag: CdkDrag, drop: CdkDropList): boolean {
    const dragListSortedItems = drop.getSortedItems();

    const dragged = drop.element.nativeElement.getElementsByClassName(
      'cdk-drag-preview',
    )[0] as HTMLElement;

    const elementToSort =
      dragListSortedItems[index]._dragRef.getVisibleElement();

    const draggedRect = dragged.getBoundingClientRect();

    const elementToSortRect = elementToSort.getBoundingClientRect();

    const elementTransform = elementToSort.style.transform;

    let elementToSortTop = elementToSortRect.top;

    let transformValue = 0;

    if (elementTransform && elementTransform.includes('translate3d')) {
      const dimensions = elementTransform.split(',');

      const yTransform = dimensions[1].replace('px', '');

      transformValue = parseFloat(yTransform);

      elementToSortTop -= transformValue;
    }

    if (draggedRect.top - 2 <= elementToSortTop) return true;

    return (
      draggedRect.top > elementToSortTop &&
      draggedRect.bottom + transformValue <= elementToSortRect.bottom
    );
  }

  /*
  private _getFormViewScreenshot(form: Form) {
    const viewFormRef = this.viewRef.createComponent(FormViewComponent);
    viewFormRef.location.nativeElement.classList.add('screenshot-container');

    viewFormRef.setInput('viewForm', form);

    html2canvas(viewFormRef.location.nativeElement, {
      scale: 2,
      allowTaint: true,
      useCORS: true,
    }).then((canvas) => {
      const base64Image = canvas.toDataURL('image/png');

      viewFormRef.destroy();

      console.log('screenshot done');
    });

    // if (typeof Worker !== 'undefined') {
    //   debugger;
    //   const worker = new Worker('src/app/core/form-view-screenshot.worker.ts');
    //
    //   worker.postMessage({
    //     myFunction: JSONfn.stringify( (arg) => ... ),
    //     payload: ... // any kind of data, let the function decide whether it's useful
    // });
  }
*/
}
