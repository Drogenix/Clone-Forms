import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'lastUpdateDate',
  standalone: true,
})
export class LastUpdateDatePipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');
  transform(dateToParse: Date): string | null {
    const now = new Date();

    const date = new Date(dateToParse);

    if (sameDay(date, now) && sameMonth(date, now))
      return 'сегодня, в ' + this.datePipe.transform(date, 'HH:mm');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (sameDay(date, yesterday) && sameMonth(date, yesterday))
      return 'вчера, в ' + this.datePipe.transform(date, 'HH:mm');

    return this.datePipe.transform(date, 'dd MMM в HH:mm', '', 'ru');
  }
}

function sameDay(date1: Date, date2: Date): boolean {
  return date1.getDay() === date2.getDay();
}

function sameMonth(date1: Date, date2: Date): boolean {
  return date1.getMonth() === date2.getMonth();
}
