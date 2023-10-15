import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-rename-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rename-form-dialog.component.html',
  styleUrls: ['./rename-form-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RenameFormDialogComponent implements OnInit{
  formName = this.fb.nonNullable.control('', Validators.required);
  constructor(private fb:FormBuilder,
              @Inject(POLYMORPHEUS_CONTEXT)
              private readonly context: TuiDialogContext<boolean | string, string>) {}

  ngOnInit(): void {
    const data = this.context.data;
    this.formName.setValue(data);
  }
  cancel(){
    this.context.completeWith(false);
  }
  submit(){
    if(this.formName.valid)
    this.context.completeWith(this.formName.value);
  }
}
