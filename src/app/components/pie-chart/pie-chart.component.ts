import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiPieChartModule } from '@taiga-ui/addon-charts';
import { TuiHintModule } from '@taiga-ui/core';
import { FormatResponsesTotalPipe } from '../../core/pipes/format-responses-total.pipe';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [
    CommonModule,
    TuiPieChartModule,
    TuiHintModule,
    FormatResponsesTotalPipe,
  ],
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent implements OnInit {
  @Input() value: number[];
  @Input() labels: string[];
  valuePercentage: number[] = [];
  valueSum = 0;
  getColor(index: number) {
    return `var(--tui-chart-${index})`;
  }

  ngOnInit(): void {
    this.value.forEach((val) => (this.valueSum += val));
    this._getValuesPercentage();
  }

  private _getValuesPercentage() {
    this.value.forEach((val) => {
      const percentage = Math.round((val * 100) / this.valueSum);

      this.valuePercentage.push(percentage);
    });
  }
}
