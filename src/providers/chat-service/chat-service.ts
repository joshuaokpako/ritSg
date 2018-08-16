import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
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
    this.chat =this.db.col$('users/'+this.uS.uid +'/chats', ref => ref.orderBy('updatedAt','desc'));
    return this.chat;
  }

  getChatPerson(uid){
    return  this.db.doc$('users/'+uid)
  }

  getConvo(uid){
    return  this.db.doc$('users/'+uid+'/chats/'+this.uS.uid)
    .pipe(
      map((chat:any)=>{
        if(chat){
            return chat
        }
        else{
          chat= {messageKey: " "}
          return chat
        }
      })
    )
  }

  getMessgages(key){
    if(key){
      return this.db.col$('messages/'+key +'/chats', ref => ref.orderBy('createdAt','asc'));
    }
  }

  saveMessage(data,key){
    
    let themessage ={
      sentTo:data.chatUid,
      sentBy: this.uS.userName,
      uid: this.uS.uid,
      message: data.message,
      readBy: []
    }
    return this.db.add('messages/'+key+'/chats', themessage)
     
    
  }

  updateUnreadMessages(chatUid){
    let receiver ={ // the recievers info to put in senders database
      unreadMessages: []
    }
    this.db.update('users/'+this.uS.uid+'/chats/'+chatUid,receiver)
  }

  getReceiverUnreadMessages(chatUid){
   return this.db.doc$('users/'+chatUid+'/chats/'+this.uS.uid)
  }

  getMyUnreadMessages(chatUid){
    return this.db.doc$('users/'+this.uS.uid+'/chats/'+chatUid)
  }

  addChat(data,messageKey,recUnread){
    recUnread.push(data.message)
    console.log(recUnread)
    let sender ={ //the senders info to put in receivers database
      name : this.uS.userName,
      uid: this.uS.uid,
      userRef: this.db.doc('users/'+this.uS.uid).ref,
      lastMessage:data.message,
      messageKey:messageKey,
      unreadMessages:recUnread

    }
    let receiver ={ // the recievers info to put in senders database
      name : data.name,
      photoUrl: data.photoUrl,
      uid: data.chatUid,
      userRef: this.db.doc('users/'+data.chatUid).ref,
      lastMessage:data.message,
      messageKey:messageKey,
      unreadMessages: []

    }
    this.db.upsert('users/'+this.uS.uid+'/chats/'+data.chatUid,receiver).then(()=>{
      return  this.db.upsert('users/'+data.chatUid+'/chats/'+this.uS.uid,sender)
    })
  }
}
