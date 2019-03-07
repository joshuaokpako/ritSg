import { Component, OnInit, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, Content, Navbar,Events } from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

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
message ='';
receiver:any;
chats;
key:string;
subscription;
receiverUnreadMessages:any;
myUnreadMessages:any;
getUnreadSub;
sub;
now;
tabBarElement:any;
@ViewChild(Navbar) navBar: Navbar;
@ViewChild(Content) content: Content;
public user;
public name:string;
  constructor(public events: Events,public uS: UserserviceProvider,public chatServ:ChatServiceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.data.chatUid= this.navParams.get('uid');
    this.key= this.navParams.get('key');
    this.name= this.navParams.get('name');
    this.now = new Date().getTime()
    this.user= "";
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewWillEnter() {
    this.events.publish('chat entered', true, this.data.chatUid);
    this.tabBarElement.style.display = 'none';
    let observer = new Subject()
    
      
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  toBottom(){
    this.content.scrollToBottom(0)
  }

  ngOnInit(){
    this.user = this.uS.uid
     this.chats = this.chatServ.getMessages(this.key)
      this.chatServ.getReceiverUnreadMessages(this.data.chatUid).subscribe((x:any)=>{
        if(x){
          this.receiverUnreadMessages = x.unreadMessages;
        }
      });
  
      //get my unread messages with the other party and empty it
      this.getUnreadSub =this.chatServ.getMyUnreadMessages(this.data.chatUid).subscribe((my:any)=>{ 
        if (my) { // if there is a chat convo
          this.myUnreadMessages = my.unreadMessages;
          if(this.myUnreadMessages.length!= 0){
            this.chatServ.updateUnreadMessages(this.data.chatUid)
          }
        }
      });
     
      
      this.sub = this.chatServ.getChatPerson(this.data.chatUid).subscribe((recOutput:any)=>{
        let recName:string = recOutput.fullName
        if (recName.length>18){
         recOutput.fullName = recName.slice(0,18) + '...'
        }
        this.receiver = recOutput 
      })

    
    
     
  }

  ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
    if(this.sub){
      this.sub.unsubscribe();
    }
   
    if(this.getUnreadSub){
      this.getUnreadSub.unsubscribe()
    }
   }

  sendMessage(){
    if (this.key ===' ') { // create key and call getMessages because it is the first message between the two people
      this.key = this.data.chatUid + this.uS.uid
      this.data.message=this.message.trim()
      this.message = ""
      this.receiverUnreadMessages = []
      if (this.data.message!="") {
        this.chatServ.saveMessage(this.data,this.key).then((x)=>{
          this.chatServ.addChat(this.data,this.key,this.receiverUnreadMessages)
          this.chats = this.chatServ.getMessages(this.key)
        })
      }
    }
    else{ // don't call getMessages because already called in ngOninit
      this.data.message=this.message.trim()
      this.message = ""
      if (this.data.message!="") {
        this.chatServ.saveMessage(this.data,this.key).then((x)=>{
          this.chatServ.addChat(this.data,this.key,this.receiverUnreadMessages)
        })
      }
    }

  }

  
  ionViewDidLoad() {
    this.navBar.backButtonClick = (ev:UIEvent) => {
      this.navCtrl.popToRoot()
    };
  }

}
