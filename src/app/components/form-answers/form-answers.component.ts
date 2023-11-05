import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextInputComponent } from '../text-input/text-input.component';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { Answer } from '../../core/entity/answer';
import { QuestionType } from '../../core/entity/question-type';
import { QuestionTypeGroup } from '../../core/enum/question-type-group';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { RenameFormDialogComponent } from '../rename-form-dialog/rename-form-dialog.component';
import { of, switchMap, takeUntil, tap } from 'rxjs';
import { TuiDialogService } from '@taiga-ui/core';
import { InputImageDialogComponent } from '../input-image-dialog/input-image-dialog.component';
import { TuiDestroyService } from '@taiga-ui/cdk';

interface QuestionAnswers {
  offeredAnswers: Answer[];
  anotherAnswer?: Answer;
}

const ANSWERS_MAX = 29;

@Component({
  selector: 'app-form-answers',
  standalone: true,
  imports: [
    CommonModule,
    TextInputComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormAnswersComponent),
      multi: true,
    },
    TuiDestroyService,
  ],
  templateUrl: './form-answers.component.html',
  styleUrls: ['./form-answers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAnswersComponent implements ControlValueAccessor {
  form = this.fb.group({
    offeredAnswers: this.fb.array([]),
    anotherAnswer: this.fb.control<Answer | undefined>(undefined),
  });
  questionAnswers: QuestionAnswers;
  @Input()
  get questionType(): QuestionType {
    return this._questionType;
  }
  set questionType(value: QuestionType) {
    if (this._questionType != value && this._questionType) {
      if (this._questionType.group != value.group) {
        if (value.group === QuestionTypeGroup.Text) {
          this._createTextAnswer();
        } else if (value.group === QuestionTypeGroup.List) {
          this._createListAnswer();
        }

        this._onChange(this.questionAnswers);
      }
    }

    this._questionType = value;
  }
  private _questionType: QuestionType;
  private _onChange: Function;
  private _onTouched: Function;

  constructor(
    private fb: FormBuilder,
    private dialogService: TuiDialogService,
    private destroy$: TuiDestroyService,
    private cdr: ChangeDetectorRef,
  ) {}

  private _createTextAnswer() {
    this.questionAnswers = {
      anotherAnswer: undefined,
      offeredAnswers: [
        {
          id: 0,
          value: '',
        },
      ],
    };
  }

  private _createListAnswer() {
    this.questionAnswers = {
      anotherAnswer: undefined,
      offeredAnswers: [
        {
          id: 0,
          value: 'Вариант 1',
        },
      ],
    };
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(obj: QuestionAnswers): void {
    this.questionAnswers = obj;

    this.questionAnswers.offeredAnswers.forEach((answer) => {
      const answerControl = this.fb.control(answer);
      this.form.controls.offeredAnswers.push(answerControl);
    });

    this.form.controls.anotherAnswer = this.fb.control<Answer | undefined>(
      this.questionAnswers.anotherAnswer,
    );
  }

  addAnswer() {
    if (this.questionAnswers.offeredAnswers.length === ANSWERS_MAX) return;

    const answer: Answer = {
      id: this.questionAnswers.offeredAnswers.length + 1,
      value: 'Вариант ',
      order: this.questionAnswers.offeredAnswers.length + 1,
    };

    answer.value += answer.id;
    this.questionAnswers.offeredAnswers.push(answer);

    this._onChange(this.questionAnswers);
  }

  addAnotherAnswer() {
    this.questionAnswers.anotherAnswer = {
      id: this.questionAnswers.offeredAnswers.length + 1,
      value: '',
    };
    this._onChange(this.questionAnswers);
  }

  removeAnswer(index: number) {
    if (index === -1) {
      this.questionAnswers.anotherAnswer = undefined;
      return;
    }
    this.questionAnswers.offeredAnswers.splice(index, 1);
    this._onChange(this.questionAnswers);
  }

  updateAnswer(newValue: string, index: number) {
    this.questionAnswers.offeredAnswers[index].value = newValue;

    this._onChange(this.questionAnswers);
  }

  addImage(index: number) {
    this.dialogService
      .open<string>(new PolymorpheusComponent(InputImageDialogComponent), {
        size: 's',
        closeable: true,
        dismissible: false,
      })
      .pipe(
        tap({
          next: (imageUrl) => {
            if (index === -1 && this.questionAnswers.anotherAnswer) {
              this.questionAnswers.anotherAnswer.image = imageUrl;
            } else {
              this.questionAnswers.offeredAnswers[index].image = imageUrl;
            }

            this.cdr.markForCheck();

            this._onChange(this.questionAnswers);
          },
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  removeImage(index: number) {
    if (index === -1 && this.questionAnswers.anotherAnswer) {
      this.questionAnswers.anotherAnswer.image = undefined;
      return;
    }

    this.questionAnswers.offeredAnswers[index].image = undefined;

    this._onChange(this.questionAnswers);
  }

  onDrop(event: CdkDragDrop<Answer[]>) {
    if (event.previousIndex != event.currentIndex) {
      this._changeAnswerOrder(event.previousIndex, event.currentIndex);
    }
  }

  private _changeAnswerOrder(previousIndex: number, currentIndex: number) {
    const draggedItem = this.questionAnswers.offeredAnswers[previousIndex];

    const movedItem = this.questionAnswers.offeredAnswers[currentIndex];

    const oldOrder = draggedItem.order;

    draggedItem.order = movedItem.order;
    movedItem.order = oldOrder;

    moveItemInArray(
      this.questionAnswers.offeredAnswers,
      previousIndex,
      currentIndex,
    );

    this._onChange(this.questionAnswers);
  }
}
