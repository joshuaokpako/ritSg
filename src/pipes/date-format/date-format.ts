import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Generated class for the DateFormatPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Takes a value and customize the date
   */
  transform(value: string, fromNow:string) {
    if (fromNow =='true') {
      return moment(value).fromNow();
    }
    else {
      return moment(value,  ["MM-DD-YYYY", "MMMM DD YYYY"]).calendar(null, {
        sameDay: '[Today]',
        nextDay: '[Tomorrow]',
        nextWeek: 'dddd',
        lastDay: '[Yesterday]',
        lastWeek: '[Last] dddd',
        sameElse: 'MMMM DD YYYY'
      });
    }
    
  }
}
