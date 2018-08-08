import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore,  AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, take} from 'rxjs/operators';
import * as firebase from 'firebase'
/*
  Generated class for the FirestoreProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable()
export class FirestoreProvider {

  constructor(public http: HttpClient,private afs: AngularFirestore) {
    console.log('Hello FirestoreProvider Provider');
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    })
  }

  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp
    return this.doc(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

  upsert<T>(ref: DocPredicate<T>, data: any) {
    const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise()
  
    return doc.then(snap => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data)
    })
  }

  add<T>(ref: CollectionPredicate<T>, data) {
    const timestamp = this.timestamp
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }
  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }
  
  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }
  
  
  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges().pipe(map(doc => {
        return doc.payload.data() as T;
    }));
  }
  
  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn).snapshotChanges().pipe(map(docs => {
        return docs.map(a => a.payload.doc.data()) as T[];
    }));
  }
}
