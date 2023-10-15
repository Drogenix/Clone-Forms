import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {POLYMORPHEUS_CONTEXT} from "@tinkoff/ng-polymorpheus";
import {TuiDialogContext} from "@taiga-ui/core";

@Component({
  selector: 'app-delete-form-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-form-dialog.component.html',
  styleUrls: ['./delete-form-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeleteFormDialogComponent {
  constructor(@Inject(POLYMORPHEUS_CONTEXT)
              private readonly context: TuiDialogContext<boolean | string, string>) {}

  get data():string{
    return this.context.data
  }
  cancel(){
    this.context.completeWith(false);
  }
  submit(){
      this.context.completeWith(true);
  }
}
