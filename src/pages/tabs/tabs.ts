import { Component, OnInit, ViewChild } from '@angular/core';
import {Events, Keyboard, IonicPage, App, Tabs, NavController} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { map, share, takeUntil, tap } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FcmProvider } from '../../providers/fcm/fcm';
import { Toast } from '@ionic-native/toast';

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
  constructor(public uS:UserserviceProvider, public events: Events,public fcm: FcmProvider,public toast:Toast,public chatServ:ChatServiceProvider,public keyboard: Keyboard, public app: App,public navCtrl: NavController) {
    
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
     this.chatNotification.subscribe()
      
    
     
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
          if(msg.type=== 'message'){
            if(this.notifyToast == true && this.chatId != msg.userId){
              // show a toast
              this.toast.show(msg.title +' \n'+ msg.body, '5000', 'center').subscribe(
                toast => {
                  if(toast.event ==='touch'){
                    this.navCtrl.parent.select(3)
                  }
                })
            }
          }
          else{
            // show a toast
            switch (msg.type) {
              case 'feed':
                // show a toast
              this.toast.show(msg.title +' \n'+ msg.body, '5000', 'center').subscribe(
                toast => {
                  if(toast.event ==='touch'){
                    if(this.navCtrl.parent){
                      this.navCtrl.parent.select(2)
                    }
                    else{
                      this.tabRef.select(2);
                    }
                  }
                })
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
        }
      })
      
    ).subscribe()

    this.events.subscribe('chat entered', (entered,id) => {
      this.notifyToast = entered
      this.chatId = id;
    });
  }
  ionViewWillLeave(){
    if(this.chatNotification){
      this.chatNotification.unsubscribe()
    }
  }
}
