import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map } from 'rxjs/operators';

/**
 * Generated class for the MessagePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})
export class MessagePage implements OnInit{
data = { name:'', chatUid:'', message:'',photoUrl:'' };
chats:any;
subscription;
tabBarElement:any;
public user;
public name:string;
  constructor(public uS: UserserviceProvider,public chatServ:ChatServiceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.data.name = this.navParams.get('name');
    this.data.chatUid= this.navParams.get('uid');
    this.data.photoUrl = this.navParams.get('pic');
    this.user= "";
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  ngOnInit(){
    this.subscription = this.uS.user.pipe(map((user:any)=>{
       return user    
     })).subscribe(x=>this.user=x )
    this.chatServ.getConvo(this.data.chatUid).subscribe(x=> this.chats = x)

  
  }

  ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
   
   }

  sendMessage(){
    this.data.message= this.data.message.trim()
    if (this.data.message!="") {
      this.chatServ.saveMessage(this.data).then((x)=>{
        this.chatServ.addChat(this.data,this.chatServ.key)
        this.data.message ="";
      })
    }

  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad MessagePage');
  }

}
