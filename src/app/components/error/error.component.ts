import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppError } from '../../core/entity/app-error';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorComponent {
  @Input() error: AppError = {
    status: 0,
    message: 'Форма не найдена',
    details:
      'Возможные причины ошибки: указан неверный URL или форма не существует.',
  };
}
