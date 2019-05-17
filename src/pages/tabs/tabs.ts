import { Component, OnInit, ViewChild } from '@angular/core';
import {Events, Keyboard, IonicPage, App, Tabs, ToastController, NavController, Platform} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { map, share, takeUntil, tap } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FcmProvider } from '../../providers/fcm/fcm';

@IonicPage()
@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {
  @ViewChild('myTabs') tabRef: Tabs;
  tabBarElement:any;
  tabShow;
  chatNotification;
  tab1Root = 'HomePage';
  tab2Root = 'PlannerPage';
  tab3Root = 'FeedsPage';
  tab4Root = 'ChatsPage';
  tab5Root = 'ProfilePage';
  tab ='0';
  notif = 0;
  notifyToast =true;
  chatId="";
  Fcm;
  constructor(public uS:UserserviceProvider, public events: Events,public fcm: FcmProvider,public toastCtrl: ToastController,public chatServ:ChatServiceProvider,public keyboard: Keyboard, public app: App,public navCtrl: NavController,public platform:Platform) {
    
    this.uS.fireAuth.authState.subscribe(user => {
      if (user) {
        this.tabShow = user.isAnonymous
    
      } 
    })
    let n= 0;
    this.chatNotification =this.chatServ.getChats().pipe(map((ch:any)=>{
      //Only get the users info on page entry and keep it until page leave
      let notif =0;
      ch.forEach((myelement,i,array) => {
        if(i<array.length-1){
         notif += array[i].unreadMessages.length + array[i+1].unreadMessages.length
         this.notif = notif;
          if(this.notif!==0){
            n+=1;
            if (n===1){
              this.tabRef.select(3);
              console.log(this.tab) 
            }
          }
          else{
            n = 3;
          }
        }
      })
      if(notif == 0){
        this.events.publish('notif',  undefined);
      }
      else{
        this.events.publish('notif', notif);
      }
      
      return (notif == 0)? undefined : notif
      }),share()
     )
      
    
     
  }

  ngOnInit(){
    this.Fcm = this.fcm.listenToNotifications().pipe(
      tap(msg => {
        if(msg.wasTapped){
          switch (msg.type) {
            case 'message':
              this.tabRef.select(3);
              break;
            case 'feed':
              this.tabRef.select(2);
              break;
            case 'job':
              this.navCtrl.push('JobsPage')
              break;
            case 'event':
            this.navCtrl.push('EventsPage')
              break;
          
            default:
              this.tabRef.select(0);
              break;
          }
          
        }
        else{
          if(!this.platform.is('ios')){
            if(msg.type=== 'message'){
              if(this.notifyToast == true && this.chatId != msg.userId){
                // show a toast
                const toast = this.toastCtrl.create({
                  message: msg.title +' \n'+ msg.body,
                  duration: 5000,
                  position: "top",
                  cssClass: 'alertToast',
                  dismissOnPageChange: true
                });
                toast.present();
              }
            }
            else{
              // show a toast
              const toast = this.toastCtrl.create({
                message: msg.title +' \n'+ msg.body,
                duration: 5000,
                position: "top",
                cssClass: 'alertToast',
                dismissOnPageChange: true
              });
              toast.present();
            }
          }
        }
      })
      
    ).subscribe()

    this.events.subscribe('chat entered', (entered,id) => {
      this.notifyToast = entered
      this.chatId = id;
    });
  }
  ionViewWillLeave(){
  }
}
