import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Answer } from '../../core/entity/answer';
import { Question } from '../../core/entity/question';
import { TextInputComponent } from '../text-input/text-input.component';
import { FormQuestionResponse } from '../../core/entity/question-response';
import { TextRichEditorComponent } from '../text-rich-editor/text-rich-editor.component';

@Component({
  selector: 'app-form-view-question',
  standalone: true,
  imports: [CommonModule, TextInputComponent, TextRichEditorComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormViewQuestionComponent),
      multi: true,
    },
  ],
  templateUrl: './form-view-question.component.html',
  styleUrls: ['./form-view-question.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormViewQuestionComponent implements ControlValueAccessor {
  @Input() questionResponse: FormQuestionResponse;
  @Input() disabled = false;
  @Input() question: Question;
  anotherAnswer: Answer;
  private _onChange: Function;
  private _onTouched: Function;
  private _touched: boolean = false;
  constructor(private cdr: ChangeDetectorRef) {}
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  writeValue(value: FormQuestionResponse): void {
    this.questionResponse = value;

    if (this.question.answers.anotherAnswer) {
      this.anotherAnswer = this.question.answers.anotherAnswer;

      const anotherAnswerResponseIndex = value.answers.findIndex(
        (answer) => answer.id === this.anotherAnswer.id,
      );

      this.anotherAnswer.value =
        anotherAnswerResponseIndex === -1
          ? ''
          : value.answers[anotherAnswerResponseIndex].value;
    }
    this.cdr.markForCheck();
  }

  private _onValueChange() {
    if (!this._touched) {
      this._onTouched();
    }

    this._onChange(this.questionResponse);
  }

  textAnswerChanged(answer: Answer, newValue: string) {
    if (newValue === '') {
      this.questionResponse.answers = [];
    } else {
      answer.value = newValue;
      this.questionResponse.answers = [answer];
    }

    this._onValueChange();
  }

  anotherAnswerChanged(newValue: string) {
    if (this.anotherAnswer) {
      this.anotherAnswer.value = newValue;

      if (!this.isSelected(this.anotherAnswer.id)) {
        this.questionResponse.answers.push(this.anotherAnswer);
      }

      this._onValueChange();
    }
  }

  checkboxAnswerChanged(newAnswer: Answer) {
    if (this.questionResponse.answers.length === 0) {
      this.questionResponse.answers.push(newAnswer);
      this._onValueChange();
      return;
    }
    for (let i = 0; i < this.questionResponse.answers.length; i++) {
      const answer = this.questionResponse.answers[i];

      if (answer.id === newAnswer.id) {
        this.questionResponse.answers.splice(i, 1);
        this._onValueChange();
        return;
      }
    }

    this.questionResponse.answers.push(newAnswer);
    this._onValueChange();
  }

  radioAnswerChanged(answer: Answer) {
    this.questionResponse.answers = [answer];

    this._onValueChange();
  }

  isSelected(id: number): boolean {
    for (let i = 0; i < this.questionResponse.answers.length; i++) {
      if (this.questionResponse.answers[i].id === id) return true;
    }
    return false;
  }

  clearResponse() {
    this.questionResponse.answers = [];
    if (this.anotherAnswer) this.anotherAnswer.value = '';

    this._onValueChange();
  }
}
