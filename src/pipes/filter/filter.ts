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
            let replacement = it.fullName.replace(/\s/, "") 
            if (replacement.search(/\s/g) !=-1 && 
            it.fullName.slice(pos,pos+len).toLowerCase().includes(searchText) == false)  { 

              let newPos_1 = replacement.search(/\s/g) + 2
              let replacement_1 = replacement.replace(/\s/, "") 
              if (replacement_1.search(/\s/g) !=-1 && 
              it.fullName.slice(newPos_1,newPos_1+len).toLowerCase().includes(searchText) == false)  {

                let newPos_2 = replacement_1.search(/\s/g) + 3
                let replacement_2 = replacement_1.replace(/\s/, "") 
                if (replacement_2.search(/\s/g) !=-1 && 
                it.fullName.slice(newPos_2,newPos_2+len).toLowerCase().includes(searchText) ==false)  {

                  let newPos_3 = replacement_2.search(/\s/g) + 4
                    return it.fullName.slice(newPos_3,newPos_3+len).toLowerCase().includes(searchText)
                }
                else{
                  return it.fullName.slice(newPos_2,newPos_2+len).toLowerCase().includes(searchText)
                }
              }
              else{
                return it.fullName.slice(newPos_1,newPos_1+len).toLowerCase().includes(searchText)
              }
              
            }
            else{
              return it.fullName.slice(pos,pos+len).toLowerCase().includes(searchText)
            }
          }
          else{
            return it.fullName.slice(0,len).toLowerCase().includes(searchText);
          }
    });
  }
}
