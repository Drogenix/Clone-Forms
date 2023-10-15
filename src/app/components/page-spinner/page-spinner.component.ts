import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-spinner.component.html',
  styleUrls: ['./page-spinner.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSpinnerComponent {

}
