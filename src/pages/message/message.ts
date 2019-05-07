import { Component, OnInit, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, Content, Navbar,Events, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, takeUntil, take } from 'rxjs/operators';
import { Observable, Subject, pipe } from 'rxjs';

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
chats:any = [];
key:string;
subscription;
receiverUnreadMessages:any;
myUnreadMessages:any;
getUnreadSub;
sub;
doc;
now;
hasRead= false;
tabBarElement:any;
blockedUsers;
blocked = false;
youblocked = false;
lastMess
scroll = true; // to scroll to bottom when neccessary
scrollTop =0

@ViewChild(Navbar) navBar: Navbar;
@ViewChild(Content) content: Content;
public user;
public name:string;
  constructor(public events: Events,public uS: UserserviceProvider,public chatServ:ChatServiceProvider, public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController,public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController,) {
    this.data.chatUid= this.navParams.get('uid');
    this.key= this.navParams.get('key');
    this.name= this.navParams.get('name');
    this.lastMess = this.navParams.get('lastMess');
    this.now = new Date().getTime()
    this.user= "";
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewWillEnter() {
    this.uS.updateChatActivity(this.data.chatUid);
    this.events.publish('chat entered', true, this.data.chatUid);
    this.tabBarElement.style.display = 'none';
    let observer = new Subject()
    
      
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
    this.uS.updateChatActivity('');
  }

  toBottom(){
    if(this.scroll===true){
      this.content.scrollToBottom(0).then(()=>{
        this.scrollTop = this.content.scrollTop
      })
    }
  }

  checkscroll(){
    console.log(this.content.scrollTop)
    if(this.content.scrollTop <5){

    }
  }

  ngOnInit(){
    this.content.ionScroll.subscribe((x)=>{
      if (Math.abs(x.scrollTop -this.scrollTop) <30){
        console.log('he')
        this.scroll = true
      }
    });
    let test = 0; // check if message was added or page was just refreshed
    let n= 0;
    let p = 0;
    this.user = this.uS.uid
    this.uS.getBlockedUser().pipe(take(1)).subscribe(x=>{
      this.blockedUsers = x;
      this.blockedUsers.forEach(element => {
        if(element.blocked === this.data.chatUid){ 
          this.blocked = true;
          n += 1;
          let alert = this.alertCtrl.create({
            title: 'Blocked',
            message: 'This user has been blocked by you',
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          if(n ===1){
            n += 1;
            console.log(n)
            alert.present();
            this.chats = ' '
          }
        }
      });
    })
    this.uS.getOtherBlockedUser().pipe(take(1)).subscribe(x=>{
      this.blockedUsers = x;
      this.blockedUsers.forEach(element => {
        if(element.blockedBy === this.data.chatUid){ 
          this.youblocked = true;
          p += 1;
          let alert = this.alertCtrl.create({
            title: 'Blocked',
            message: 'You have been blocked by this user',
            buttons: [
              {
                text: 'Ok',
                role: 'cancel',
                handler: () => {
                }
              }
            ]
          });
          if(p ===1){
            console.log('yh')
            alert.present()
            this.chats = ' '
            
          }
        }
      });
    })
     this.chatServ.getMessages(this.key,'',0).subscribe((x)=>{
      x.forEach(element => {
          this.chats.push(element)
   
      });
      test = 1;
     })
      this.chatServ.getReceiverUnreadMessages(this.data.chatUid).subscribe((x:any)=>{
        if(x){
          if(x.unreadMessages.length ==0){
            this.hasRead = true;
          }
          else{
            this.hasRead = false;
          }
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

  getFirst(doc){
    this.doc = doc
  }

  doInfinite(infiniteScroll){
    this.scroll = false;
    let load =0 // to check if command started here or at observable
    this.chatServ.getMessages(this.key,this.doc,1).pipe(take(1)).subscribe((x)=>{
      if(load===0){
        x.forEach(element => {
          this.chats.unshift(element)

          load =1;
          infiniteScroll.complete();
        });
        console.log(this.chats)
      }
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
    this.hasRead = false;
    if (this.key ===' ') { // create key and call getMessages because it is the first message between the two people
      this.key = this.data.chatUid + this.uS.uid
      this.data.message=this.message.trim()
      this.message = ""
      this.receiverUnreadMessages = []
      if (this.data.message!="") {
        this.chatServ.saveMessage(this.data,this.key).then((x)=>{
          this.chatServ.addChat(this.data,this.key,this.receiverUnreadMessages)
         // this.chats = this.chatServ.getMessages(this.key)
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

  showMore(blocked,reportName, reportEmail) {
    let blockText
    if(this.blocked){
      blockText= 'Unblock'
    }
    else{
      blockText = 'Block'
    }
    
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: blockText,
          role: 'destructive',
          handler: () => {
            this.presentConfirm(blocked)
          }
        },{
          text: 'Report',
          role: 'destructive',
          handler: () => {
            let people = {
              reportName: reportName,
              reportEmail: reportEmail,
              reportId: blocked
              
            }
            if(blocked ===this.uS.uid){
              let alert = this.alertCtrl.create({
                title: 'Error',
                message: "You can't report yourself",
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {
                    }
                  }
                ]
              });
              alert.present();
            }
            else{
            this.addReportModal(people)
            }
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  presentConfirm(blocked) {
    if(!this.blocked){
    let alert = this.alertCtrl.create({
      title: 'Confirm Block',
      message: 'Do you want to block this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Block',
          handler: () => {
            this.blockUser(blocked);
          }
        }
      ]
    });
    alert.present();
  }
  else{
    this.uS.unBlockUser(blocked).then(()=>{
      this.blocked= false
      this.ngOnInit();
    })
  }
  }
  blockUser(blocked){
    if (blocked === this.uS.uid){
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: "You can't block yourself",
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      alert.present();
    }
    else{
      this.uS.blockUser(blocked).then(()=>{
        this.blocked=true
        this.ngOnInit();
      })
    }
  }

  addReportModal(person){
    let modal = this.modalCtrl.create('ReportPage', person)
    modal.present()
  }

}

