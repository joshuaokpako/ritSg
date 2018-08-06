import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FilterPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], searchText: string) {
    if(!items) return [];
    if(!searchText) return items;
    searchText = searchText.toLowerCase();
    let len = searchText.length
    return items.filter( it => {
          if (it.fullName.slice(0,len).toLowerCase().includes(searchText)==false) {
            let pos = it.fullName.search(/\s/g) + 1
              return it.fullName.slice(pos,pos+len).toLowerCase().includes(searchText)   
          }
          else{
            return it.fullName.slice(0,len).toLowerCase().includes(searchText);
          }
    });
  }
}
