import { Pipe, PipeTransform } from '@angular/core';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { Observable } from 'rxjs';

/**
 * Generated class for the DocPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'doc',
})
export class DocPipe implements PipeTransform {
  constructor(private db: FirestoreProvider) {}

  transform(value: any): Observable<any> {
    return this.db.doc$(value.path)
  }
}
