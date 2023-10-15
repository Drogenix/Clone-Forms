import {ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule} from "@angular/forms";
import {debounceTime, distinctUntilChanged, map} from "rxjs";

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CounterComponent implements OnInit{
  @Output() onChange = new EventEmitter<number>();
  @Input() max = 10;
  @Input() min = 1;
  @Input() value = 1;
  counter = new FormControl<number>(this.value,{nonNullable:true});
  previousValue = NaN;
  ngOnInit() {
    this.counter.valueChanges.pipe(
      map((value)=>{
        if(value > this.max) {
          this.counter.setValue(this.max);
          return this.max;
        }

        if(value <= 0 && value != null){
          this.counter.setValue(1);
          return 1;
        }

        return value;
      }),
      debounceTime(200),
      distinctUntilChanged(),
    ).subscribe( (value)=>{
      if(value && value != this.previousValue){
        this.previousValue = value;

        this.onChange.emit(value);
      }
    })
  }

  onBtnClick(val:number){
    this.counter.setValue(this.counter.value + val);
  }
}
