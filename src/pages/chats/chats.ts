import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ModalController, Events, AlertController} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Observable, Subject } from 'rxjs';
import { map, share,takeUntil } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-chats',
  templateUrl: 'chats.html',
  providers: [ChatServiceProvider]
})
export class ChatsPage implements OnInit{
  sub;
  public chats:Observable<any>;
  observer:Subject<any> 
  test:number;
  constructor(public events: Events,public uS:UserserviceProvider, public chServ:ChatServiceProvider,public navCtrl: NavController,public modalCtrl: ModalController, public alertCtrl:AlertController) {
  }

ionViewWillEnter(){
  this.test= 0
  this.observer = new Subject();
  this.events.publish('chat entered', false,'noId');
  this.chats =this.chServ.getChats().pipe(map((ch:any)=>{
   //Only get the users info on page entry and keep it until page leave
    ch.forEach(myelement => {
          this.uS.getRef(myelement.userRef).subscribe(x=>{
            myelement.userRef =x;
        })
      })
    return ch
    }),share()
  )
}


  ngOnInit(){
    
  }

  ionViewWillLeave(){
    this.events.publish('chat entered', true,'noId');
    this.observer.next()
    this.observer.complete()
  }

  addMessage(){
    this.navCtrl.push('AddChatPage')

  }
  goToMessage(uid,name,key){
    let that =this
    let messageObj
          messageObj = {
            name:name,
            uid: uid,
            key:key
          }
          that.navCtrl.push('MessagePage', messageObj) 
        }
        
}
