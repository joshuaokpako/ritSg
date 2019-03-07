import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

/**
 * Generated class for the TimeFilterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'timeFilter',
})
export class TimeFilterPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, fromNow:string) {
    let now = moment().format('YYYY-MM-DD')
    if(fromNow==='true'){
        return moment(now + ' '+ value, 'YYYY-MM-DD HH:mm' ).fromNow();
    }
    else if(fromNow==='false'){
      return moment(now + ' '+ value, 'YYYY-MM-DD HH:mm' ).toNow() 
    }
    else if(fromNow==='difFromNow'){
      return moment(now + ' '+ value, 'YYYY-MM-DD HH:mm').isSameOrBefore(moment())
    }
    else if(fromNow ==='eventFinished'){
      return moment(value, 'MMMM DD YYYY').isBefore(moment())
    }
    else{
      return moment(now + ' '+ value, 'YYYY-MM-DD HH:mm').valueOf()
    }
  }
}
