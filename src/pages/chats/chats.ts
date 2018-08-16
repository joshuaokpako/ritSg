import { Component, OnInit } from '@angular/core';
import { NavController, ModalController} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { AddChatPage } from '../add-chat/add-chat';
import { MessagePage } from '../message/message';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
  providers: [ChatServiceProvider]
})
export class ChatsPage implements OnInit{
  sub;
  public chats:Observable<any>;

  constructor(public uS:UserserviceProvider, public chServ:ChatServiceProvider,public navCtrl: NavController,public modalCtrl: ModalController) {
  }

ionViewWillEnter(){
  this.chats =this.chServ.getChats().pipe(map((ch:any)=>{
    ch.forEach(myelement => {
      //Only get the users info on page entry and keep it until page leave
          
          this.uS.getRef(myelement.userRef).subscribe(x=>{
            myelement.userRef =x;
        })
    })
    return ch
    })
  )
}

  ngOnInit(){
    
  }
  ionViewWillLeave(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }

  addMessage(){
    this.navCtrl.push(AddChatPage)

  }
  goToMessage(uid,name){
    let that =this
    let messageObj
    this.sub = this.chServ.getConvo(uid).subscribe(result=>{
      if(result){
      messageObj = {
        name:name,
        uid: uid,
        key: result.messageKey,
        receiverUnread: result.unreadMessages,
      }
      that.navCtrl.push(MessagePage, messageObj) 
    }
    else{
      this.goToMessage(uid,name)
    }
    })
  }
}
