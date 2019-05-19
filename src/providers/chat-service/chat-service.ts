import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
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

  encryptMessages(text,salt){
    return CryptoJS.AES.encrypt(text, salt).toString()
  }
  decryptMessages(encryption, salt){
   return CryptoJS.AES.decrypt(encryption, salt).toString(CryptoJS.enc.Utf8);
  }

  getChats(){
   return this.db.colWithIds$('users/'+this.uS.uid +'/chats', ref => ref.orderBy('lastMessTime','desc'))
   .pipe(map((x:any)=>{
    if(x){
      x.forEach(element => {
        if(element){
          element.lastMessage = this.decryptMessages(element.lastMessage,this.uS.uid)
          element.unreadMessages.forEach(myelement => {
            myelement = this.decryptMessages(myelement,this.uS.uid)
          })
        }
      });
    }
    return x
   })
  );
    
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

  getMessages(key,doc,y){
    if(key){
      if (y===0){
        return this.db.colWithIds$('messages/'+key +'/chats', ref => ref.orderBy('createdAt','desc').limit(15)).pipe(map((x:any)=>{
          x.forEach(element => {
            element.message = this.decryptMessages(element.message,key) 
          });
          return x.reverse()
        })
        )
      }
      else{
        return this.db.colWithIds$('messages/'+key +'/chats', ref => ref.orderBy('createdAt','desc').startAfter(doc).limit(15)).pipe(map((x:any)=>{
          x.forEach(element => {
            element.message = this.decryptMessages(element.message,key) 
          });
          return x
        })
        )
      }
    }
  }

  saveMessage(data,key){
    let themessage ={
      sentTo:data.chatUid,
      sentBy: this.uS.userName,
      uid: this.uS.uid,
      message: this.encryptMessages(data.message,key),
      key: key
    }
    return this.db.add('messages/'+key+'/chats', themessage)
     
    
  }

  updateUnreadMessages(chatUid){
    let receiver ={ // the recievers info to put in senders database
      unreadMessages: [],
    }
    this.db.update('users/'+this.uS.uid+'/chats/'+chatUid,receiver)
  }

  getReceiverUnreadMessages(chatUid){
   return this.db.doc$('users/'+chatUid+'/chats/'+this.uS.uid).pipe(map((x:any)=>{
    if(x){
        x.unreadMessages.forEach(myelement => {
          myelement = this.decryptMessages(myelement,chatUid)
        })
    }
    return x
   })
  )
  }

  getMyUnreadMessages(chatUid){
    return this.db.doc$('users/'+this.uS.uid+'/chats/'+chatUid).pipe(map((x:any)=>{
      if(x){
        x.unreadMessages.forEach(myelement => {
          myelement = this.decryptMessages(myelement,this.uS.uid)
        });
      }
      return x
    })
    )
  }

  addChat(data,messageKey,recUnread){
    recUnread.push(this.encryptMessages(data.message,data.chatUid))
    let sender ={ //the senders info to put in receivers database
      name : this.uS.userName,
      uid: this.uS.uid,
      userRef: this.db.doc('users/'+this.uS.uid).ref,
      lastMessage:this.encryptMessages(data.message,data.chatUid),
      messageKey:messageKey,
      unreadMessages:recUnread,
      lastMessTime: this.db.timestamp

    }
    let receiver ={ // the recievers info to put in senders database
      name : data.name,
      photoUrl: data.photoUrl,
      uid: data.chatUid,
      userRef: this.db.doc('users/'+data.chatUid).ref,
      lastMessage:this.encryptMessages(data.message,this.uS.uid),
      messageKey:messageKey,
      unreadMessages: [],
      lastMessTime: this.db.timestamp

    }
    return this.db.upsert('users/'+this.uS.uid+'/chats/'+data.chatUid,receiver).then(()=>{
      return  this.db.upsert('users/'+data.chatUid+'/chats/'+this.uS.uid,sender)
    })
  }
}
