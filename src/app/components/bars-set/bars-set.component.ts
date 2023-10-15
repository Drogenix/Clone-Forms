import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiAxesModule, TuiBarModule } from '@taiga-ui/addon-charts';
import { TuiHintModule } from '@taiga-ui/core';
import { FormatResponsesTotalPipe } from '../../core/pipes/format-responses-total.pipe';

@Component({
  selector: 'app-bars-set',
  standalone: true,
  imports: [
    CommonModule,
    TuiAxesModule,
    TuiBarModule,
    TuiHintModule,
    FormatResponsesTotalPipe,
  ],
  templateUrl: './bars-set.component.html',
  styleUrls: ['./bars-set.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarsSetComponent implements OnInit {
  @Input() value: number[];
  @Input() axisYLabels: string[];
  @Input() axisXLabels: string[];
  valuePercentage: number[] = [];
  valueSum = 0;
  maxBarValue = 0;
  verticalLines = 0;
  activeIndex = NaN;
  getColor(index: number) {
    return `var(--tui-chart-${index})`;
  }
  ngOnInit(): void {
    this.value.forEach((val) => (this.valueSum += val));

    this.maxBarValue = Math.max(...this.value);

    this._setMaxValueAndVerticalLines();

    this._getValuesPercentage();

    this.axisXLabels = this._getAxisXLabels();
  }

  private _getAxisXLabels(): string[] {
    const labels: string[] = [];
    const labelsCount = this.verticalLines;

    const minValue = this.maxBarValue / labelsCount;

    for (let i = 1; i < labelsCount; i++) {
      const number = minValue * i;

      labels.push(number.toString());
    }

    labels.push(this.maxBarValue.toString());

    return labels;
  }

  onMouseEnter(index: number): void {
    this._updateActiveItemIndex(index);
  }

  onMouseLeave(): void {
    this._updateActiveItemIndex(NaN);
  }

  private _updateActiveItemIndex(index: number) {
    if (index === this.activeIndex) return;

    this.activeIndex = index;
  }

  private _setMaxValueAndVerticalLines() {
    if (this.maxBarValue <= 9) {
      this.verticalLines = this.maxBarValue;
      return;
    }

    debugger;

    for (let i = 0; ; i++) {
      const newMax = this.maxBarValue + i;
      let roundedValue = Math.round(newMax / 16);
      let value = newMax / 16;

      if (value === roundedValue) {
        this.verticalLines = 4;
        this.maxBarValue = newMax;
        return;
      }
      roundedValue = Math.round(newMax / 25);
      value = newMax / 25;

      if (value === roundedValue) {
        this.verticalLines = 5;
        this.maxBarValue = newMax;
        return;
      }
    }
  }

  private _getValuesPercentage() {
    this.value.forEach((val) => {
      const percentage = Math.round((val * 100) / this.valueSum);

      this.valuePercentage.push(percentage);
    });
  }
}
