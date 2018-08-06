import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { AngularFirestore, AngularFirestoreCollection,AngularFirestoreDocument} from 'angularfire2/firestore';
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
  private chatCollection: AngularFirestoreCollection<any>;
  private chatDocument: AngularFirestoreDocument<any>;
  private messageCollection: AngularFirestoreCollection<any>;
  public messages:Observable<any>;
  private receiverChatDocument:AngularFirestoreDocument<any>;
  key;
 

  constructor(private afs: AngularFirestore, public uS: UserserviceProvider, public http: HttpClient) {
    this.chatCollection = this.afs.collection<any>('users/'+this.uS.uid +'/chats');

  }

  getChats(){
    this.chatCollection = this.afs.collection<any>('users/'+this.uS.uid +'/chats');
    console.log(this.uS.uid)
    this.chat =this.chatCollection.valueChanges();
    console.log(this.chatCollection.valueChanges())
    return this.chat;
  }

  getConvo(uid){
    this.chatDocument = this.afs.doc<any>('users/'+this.uS.uid+'/chats/'+uid)
     return this.chatDocument.valueChanges().pipe(
      map(chat=>{
        if(chat){
      this.messageCollection = this.afs.collection<any>('messages/'+chat.messageKey +'/chats', ref => ref.orderBy('postTime','asc'));
      this.key =chat.messageKey
      console.log(chat)
      return this.messageCollection.valueChanges()
      
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
      postTime: this.uS.firebase.firestore.Timestamp.now(),
      readBy: []
    }
    this.messageCollection = this.afs.collection<any>('messages/'+this.key +'/chats');
    return this.messageCollection.add(themessage)
     
    
  }

  addChat(data,messageKey){
    let sender ={
      name : this.uS.userName,
      photoUrl: this.uS.userPhotoUrl,
      uid: this.uS.uid,
      userRef: this.afs.doc<any>('users/'+this.uS.uid).ref,
      lastMessage:data.message,
      messageKey:messageKey

    }
    let receiver ={
      name : data.name,
      photoUrl: data.photoUrl,
      uid: data.chatUid,
      userRef: this.afs.doc<any>('users/'+data.chatUid).ref,
      lastMessage:data.message,
      messageKey:messageKey

    }
    this.chatDocument =this.afs.doc<any>('users/'+this.uS.uid+'/chats/'+data.chatUid)
    this.receiverChatDocument=this.afs.doc<any>('users/'+data.chatUid+'/chats/'+this.uS.uid)
    this.chatDocument.set(receiver,{ merge: true }).then(()=>{
      return this.receiverChatDocument.set(sender,{ merge: true })
    })
    /*console.log(now)
    let event={
      description: description,
      eventDate: moment(eventDate).format('MMMM DD YYYY, h:mm a'),
      likes:"",
      postTime: this.uS.firebase.firestore.Timestamp.now(),
      postDetails:{
        postedById:this.uid,
        postedByName:this.userName ,
        postedByPhotoUrl:this.userPhotoUrl
      },
      postImg:img,
      title:title,
      type:eventType
    }*/
   
  }
}
