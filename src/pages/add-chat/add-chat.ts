import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
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

  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams,
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
    this.users = this.uS.users.pipe(map((allUsers:any)=>{
      return allUsers.sort()
    }))
    
   }
 
   ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddChatPage');
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
