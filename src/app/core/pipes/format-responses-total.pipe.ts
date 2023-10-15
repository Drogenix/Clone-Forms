import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatResponsesTotal',
  standalone: true,
})
export class FormatResponsesTotalPipe implements PipeTransform {
  transform(totalResponses: number): string {
    const lastNumber = this._getLastNumber(totalResponses);

    if (totalResponses === 1) return '1 ответ';

    if (lastNumber > 1 && lastNumber < 5) return totalResponses + ' ответа';

    return totalResponses + ' ответов';
  }

  private _getLastNumber(num: number): number {
    const numString = num.toString();

    return parseInt(numString[numString.length - 1]);
  }
}
