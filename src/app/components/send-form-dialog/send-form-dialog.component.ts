import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-send-form-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './send-form-dialog.component.html',
  styleUrls: ['./send-form-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SendFormDialogComponent implements OnInit {
  copied = false;
  formLink = 'https://clone-forms.netlify.app/';
  constructor(
    private destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT)
    private context: TuiDialogContext<void, { link: string }>,
  ) {}

  ngOnInit(): void {
    this.formLink += this.context.data.link;
  }

  close() {
    this.context.completeWith();
  }

  copyLink() {
    navigator.clipboard.writeText(this.formLink);

    this.copied = true;

    setTimeout(() => (this.copied = false), 2000);
  }
}
