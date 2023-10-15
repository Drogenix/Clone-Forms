import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
  takeUntil,
} from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextInputComponent),
      multi: true,
    },
    TuiDestroyService,
  ],
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputComponent implements AfterViewInit, ControlValueAccessor {
  @ViewChild('editor', { static: true })
  private _elRef: ElementRef<HTMLInputElement>;
  @Input() styleClass: string;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() updateOn: 'blur' | 'change' = 'change';
  @Input() value = '';
  @Input() delay = 500;
  @Output() onChange = new EventEmitter<string>();
  private _lastValue = '';
  private _onChange: Function;
  private _onTouched: Function;

  constructor(private destroy$: TuiDestroyService) {}
  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  writeValue(value: string): void {
    this.value = value;
  }
  ngAfterViewInit(): void {
    if (this.updateOn === 'change') {
      fromEvent(this._elRef.nativeElement, 'input')
        .pipe(
          debounceTime(this.delay),
          map(() => this._elRef.nativeElement.value),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
        )
        .subscribe((value) => this._onValueChange(value));
    }
  }

  private _onValueChange(value: string) {
    if (this._onChange) this._onChange(value);

    this.onChange.emit(value);
  }

  onBlur() {
    if (this.updateOn === 'blur') {
      const value = this._elRef.nativeElement.value;

      if (this._lastValue === value) return;

      this._onValueChange(value);

      this._lastValue = value;
    }
  }
}
