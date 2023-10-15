import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  TuiDataListWrapperModule,
  TuiSelectModule,
  TuiToggleModule,
} from '@taiga-ui/kit';
import {
  ControlValueAccessor,
  FormBuilder,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TuiDataListModule,
  TuiHintModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import { TuiForModule } from '@taiga-ui/cdk';
import { AnswerTypeName } from '../../core/enum/answer-type-name';
import { TextInputComponent } from '../text-input/text-input.component';
import { FormAnswersComponent } from '../form-answers/form-answers.component';
import { Question } from '../../core/entity/question';
import { AnswerTypeGroup } from '../../core/enum/answer-type-group';
import { QuestionTypeSelectComponent } from '../question-type-select/question-type-select.component';
import {
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { TextRichEditorComponent } from '../text-rich-editor/text-rich-editor.component';

@Component({
  selector: 'app-form-question',
  standalone: true,
  host: {
    class: 'form-block',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormQuestionComponent),
      multi: true,
    },
  ],
  imports: [
    CommonModule,
    TuiToggleModule,
    ReactiveFormsModule,
    FormsModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
    TuiDataListModule,
    TuiForModule,
    TuiTextfieldControllerModule,
    TextInputComponent,
    FormAnswersComponent,
    QuestionTypeSelectComponent,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    TextRichEditorComponent,
    TuiHintModule,
  ],
  templateUrl: './form-question.component.html',
  styleUrls: ['./form-question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormQuestionComponent
  implements AfterViewInit, ControlValueAccessor
{
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCopy = new EventEmitter<void>();
  questionForm = this.fb.nonNullable.group<Question>({
    id: 0,
    title: '',
    answerType: {
      name: AnswerTypeName.OneOfTheList,
      group: AnswerTypeGroup.List,
    },
    answers: {
      offeredAnswers: [],
      anotherAnswer: undefined,
    },
    order: 1,
    required: false,
  });

  private _onChange: Function;
  private _onTouched: Function;

  constructor(private fb: FormBuilder) {}

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(obj: any): void {
    this.questionForm.patchValue(obj);
  }

  onDeleteClick() {
    this.onDelete.emit();
  }

  onCopyClick() {
    this.onCopy.emit();
  }

  ngAfterViewInit(): void {
    this.questionForm.valueChanges.subscribe(() => {
      this._onChange(this.questionForm.value);
    });
  }
}
