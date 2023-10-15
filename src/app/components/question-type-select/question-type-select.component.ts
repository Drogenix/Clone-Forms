import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  forwardRef,
} from '@angular/core';
import { NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { TuiSelectModule } from '@taiga-ui/kit';
import {
  TuiDataListModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/core';
import {
  ControlValueAccessor,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { QuestionType } from '../../core/entity/question-type';
import { QuestionTypeName } from '../../core/enum/question-type-name';
import { QuestionTypeGroup } from '../../core/enum/question-type-group';

@Component({
  selector: 'app-question-type-select',
  standalone: true,
  imports: [
    NgForOf,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiDataListModule,
    NgTemplateOutlet,
    NgIf,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuestionTypeSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './question-type-select.component.html',
  styleUrls: ['./question-type-select.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionTypeSelectComponent
  implements AfterViewInit, ControlValueAccessor
{
  readonly questionTypeGroups = [
    [
      {
        icon: 'assets/icon/text-short.png',
        value: 'Текст(строка)',
        name: QuestionTypeName.TextShort,
        group: QuestionTypeGroup.Text,
      },
      {
        icon: 'assets/icon/text-multiline.png',
        value: 'Текст(абзац)',
        name: QuestionTypeName.TextLarge,
        group: QuestionTypeGroup.Text,
      },
    ],
    [
      {
        icon: 'assets/icon/checkbox.png',
        value: 'Несколько из списка',
        name: QuestionTypeName.MultipleChoice,
        group: QuestionTypeGroup.List,
      },
      {
        icon: 'assets/icon/radio-button.png',
        value: 'Один из списка',
        name: QuestionTypeName.OneChoice,
        group: QuestionTypeGroup.List,
      },
    ],
  ];
  select = this.fb.nonNullable.control(this.questionTypeGroups[1][0]);
  private _onChange: Function;
  private _onTouched: Function;

  constructor(private fb: FormBuilder) {}

  ngAfterViewInit(): void {
    this.select.valueChanges.pipe().subscribe((value) => {
      if (this._onChange) {
        const questionType: QuestionType = {
          name: value.name,
          group: value.group,
        };

        this._onChange(questionType);
      }
    });
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  isArray(obj: any): boolean {
    return Array.isArray(obj);
  }

  writeValue(obj: QuestionType): void {
    this.questionTypeGroups.forEach((arr) => {
      arr.forEach((questionType) => {
        if (
          questionType.name === obj.name &&
          questionType.group === obj.group
        ) {
          this.select.setValue(questionType);
        }
      });
    });
  }
}
