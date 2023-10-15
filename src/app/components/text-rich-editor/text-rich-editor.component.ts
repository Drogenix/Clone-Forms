import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter, forwardRef,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {debounceTime, distinctUntilChanged, fromEvent, takeUntil} from "rxjs";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {TuiDestroyService} from "@taiga-ui/cdk";

@Component({
  selector: 'app-text-rich-editor',
  standalone: true,
  imports: [CommonModule],
  providers:[
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextRichEditorComponent),
      multi: true
    },
    TuiDestroyService
  ],
  templateUrl: './text-rich-editor.component.html',
  styleUrls: ['./text-rich-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextRichEditorComponent implements AfterViewInit, ControlValueAccessor{
  @ViewChild('editor', {static:true}) private _elRef:ElementRef;
  @Input() styleClass:string;
  @Input() placeholder:string;
  @Input() disabled = false;
  @Input()
  set value(val:string){
    this._elRef.nativeElement.textContent = val;
  }
  @Output() onChange = new EventEmitter<string>();
  private _onChange:Function;
  private _onTouched:Function;

  constructor(private destroy$:TuiDestroyService) {}

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }
  writeValue(value: string): void {
    this._elRef.nativeElement.textContent = value;
  }
  ngAfterViewInit(): void {
    fromEvent(this._elRef.nativeElement, 'input').pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(()=> {
      const value = this._elRef.nativeElement.textContent;

      if(this._onChange)
        this._onChange(value);

      this.onChange.emit(value);
    })
  }
}
