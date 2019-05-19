import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, ModalController, Events, AlertController} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Observable, Subject } from 'rxjs';
import { map, share,takeUntil, take } from 'rxjs/operators';

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
  blockedUsers;
  blockedBy;
  constructor(public events: Events,public uS:UserserviceProvider, public chServ:ChatServiceProvider,public navCtrl: NavController,public modalCtrl: ModalController, public alertCtrl:AlertController) {
  }

 ionViewWillEnter(){
 
  
}

getBlocked(){
  return new Promise(resolve => {
    this.uS.getBlockedUser().subscribe((x)=> {
      this.blockedUsers = x
      this.blockedUsers
    })
  this.uS.getOtherBlockedUser().pipe(take(1)).subscribe(x=>{
    this.blockedBy = x;
    resolve(this.blockedBy)
  })
})
}

async ngOnInit(){
    this.test= 0
    this.observer = new Subject();
    this.events.publish('chat entered', false,'noId');
    await this.getBlocked()
    this.chats =this.chServ.getChats().pipe(map((ch:any)=>{
     //Only get the users info on page entry and keep it until page leave
      ch.forEach(myelement => {
            this.uS.getRef(myelement.userRef).subscribe(x=>{
            if (x!= undefined){
              myelement.userRef =x;
              this.blockedUsers.forEach(element => {
                if(myelement.uid === element.blocked){
                  myelement.blocked = true;
                }
              });
            }
            if (x!= undefined){
            this.blockedBy.forEach(element => {
              if(myelement.uid === element.blockedBy){
                myelement.blocked = true;
              }
            });
          }
          })
        })
      return ch
      }),share()
    )
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
