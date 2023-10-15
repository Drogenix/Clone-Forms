import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiDialog } from '@taiga-ui/cdk';
import { TuiAlertOptions, TuiButtonModule } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, TuiButtonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent implements OnInit {
  message = 'Вопрос удалён';
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialog<TuiAlertOptions<string>, boolean>,
  ) {}

  ngOnInit(): void {
    if (this.context.data) this.message = this.context.data;
  }

  cancel() {
    this.context.completeWith(true);
  }

  close() {
    this.context.completeWith(false);
  }
}
