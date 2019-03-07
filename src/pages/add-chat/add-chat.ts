import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController, AlertController, Keyboard } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { map, takeUntil, share} from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

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
  observer:Subject<any> 
  test:number;
  tabBarElement;

  constructor(public uS:UserserviceProvider, public keyboard:Keyboard, public chatServ:ChatServiceProvider, public navCtrl: NavController, public navParams: NavParams,
  public viewCtrl: ViewController,public alertCtrl:AlertController) {
    this.user ="";
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
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

   ionViewWillEnter(){
    this.test= 0
    this.observer = new Subject();
    this.tabBarElement.style.display = 'none';
   }

   ionViewWillLeave(){
    this.tabBarElement.style.display = 'flex';
    this.observer.next()
    this.observer.complete()
  }
 
   ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
  }
  ionViewDidLoad() {
  }

  goToMessage(uid,name){
    this.test+=1
    let that =this
    let messageObj
    this.sub = this.chatServ.getConvo(uid).pipe(takeUntil(this.observer)).subscribe(result=>{
      if (this.test ===1){
        if(result){
          messageObj = {
            name:name,
            uid: uid,
            key: result.messageKey,
          }
          this.test = 0
          that.navCtrl.push('MessagePage', messageObj) 
        }
        else{
          let alert = this.alertCtrl.create({
            title: 'Error',
            subTitle:'There was an error in getting chat info, please try again later',
            buttons: ['OK']
          })
          this.test = 0
          alert.present();
        }
      }
  
    },share())
  }
}
