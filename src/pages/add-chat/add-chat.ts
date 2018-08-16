import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { MessagePage } from '../message/message';
import { map} from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Generated class for the AddChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-chat',
  templateUrl: 'add-chat.html',
  providers: [UserserviceProvider]
})
export class AddChatPage implements OnInit{
  public users:Observable<any>;
  public user;
  subscription;
  sub;

  constructor(public uS:UserserviceProvider,public chatServ:ChatServiceProvider, public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController) {
    this.user ="";
  }

  ngOnInit(){
    this.subscription = this.uS.user.pipe(map((user:any)=>{
      if (user.groupAdmin){
         user.groupAdmin.forEach(element => {
           switch (element) {
             case "SG":
               user.SG=true
               break;
             default:
               console.log("didn't work")
               break;
             }
         });
         return user
       }
      else{
        return user
      }     
     })).subscribe(x=>this.user=x )
    this.users = this.uS.users
    
   }

   ionViewWillLeave(){
    if(this.sub){
      this.sub.unsubscribe()
    }
  }
 
   ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddChatPage');
  }

  goToMessage(uid,name){
    let that =this
    let messageObj
    this.sub = this.chatServ.getConvo(uid).subscribe(result=>{
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
