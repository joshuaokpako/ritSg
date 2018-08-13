import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
var now =moment().format('MMMM Do YYYY, h:mm:ss a');
export interface message{
  message: string;
  timestamp: any;
  readBy: string[];

}
/*
  Generated class for the ChatServiceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ChatServiceProvider {
  public chat:Observable<any>;
  public messages:Observable<any>;
  key;
 

  constructor(private db: FirestoreProvider, public uS: UserserviceProvider, public http: HttpClient) {

  }

  getChats(){
    this.chat =this.db.col$('users/'+this.uS.uid +'/chats');
    return this.chat;
  }

  getChatPerson(uid){
    return  this.db.doc$('users/'+uid)
  }

  getConvo(uid){
    return  this.db.doc$('users/'+this.uS.uid+'/chats/'+uid)
    .pipe(
      map((chat:any)=>{
        if(chat){
          this.key =chat.messageKey
          return this.db.col$('messages/'+chat.messageKey +'/chats', ref => ref.orderBy('createdAt','asc'));
        }
      })
    )
  }

  saveMessage(data){
    if (!this.key) {
      this.key = data.chatUid + this.uS.uid
    }
    let themessage ={

      sentBy: this.uS.userName,
      uid: this.uS.uid,
      message: data.message,
      readBy: []
    }
    return this.db.add('messages/'+this.key +'/chats', themessage)
     
    
  }

  addChat(data,messageKey){
    let sender ={
      name : this.uS.userName,
      photoUrl: this.uS.userPhotoUrl,
      uid: this.uS.uid,
      userRef: this.db.doc('users/'+this.uS.uid).ref,
      lastMessage:data.message,
      messageKey:messageKey

    }
    let receiver ={
      name : data.name,
      photoUrl: data.photoUrl,
      uid: data.chatUid,
      userRef: this.db.doc('users/'+data.chatUid).ref,
      lastMessage:data.message,
      messageKey:messageKey

    }
    this.db.upsert('users/'+this.uS.uid+'/chats/'+data.chatUid,receiver).then(()=>{
      return  this.db.upsert('users/'+data.chatUid+'/chats/'+this.uS.uid,sender)
    })
  }
}
