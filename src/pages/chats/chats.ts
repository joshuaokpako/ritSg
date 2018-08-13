import { Component, OnInit } from '@angular/core';
import { NavController, ModalController} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { AddChatPage } from '../add-chat/add-chat';
import { MessagePage } from '../message/message';
import { Observable } from 'rxjs';

@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
  providers: [ChatServiceProvider]
})
export class ChatsPage implements OnInit{
  public chats:Observable<any>;

  constructor( public chServ:ChatServiceProvider,public navCtrl: NavController,public modalCtrl: ModalController) {
  }

ionViewWillEnter(){
  this.chats =this.chServ.getChats()
}

  ngOnInit(){
    
  }

  addMessage(){
    this.navCtrl.push(AddChatPage)

  }
  goToMessage(name,photoUrl,uid){
    let messageObj = {
      name: name, 
      pic:photoUrl,
      uid: uid
    }
    this.navCtrl.push(MessagePage, messageObj)
  }
}
