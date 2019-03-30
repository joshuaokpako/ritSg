import { Component, OnInit, ViewChild } from '@angular/core';
import {Events, Keyboard, IonicPage, App, Tabs} from 'ionic-angular';
import { ChatServiceProvider} from '../../providers/chat-service/chat-service';
import { map, share, takeUntil } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Subject } from 'rxjs';

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
  constructor(public uS:UserserviceProvider, public events: Events,public chatServ:ChatServiceProvider,public keyboard: Keyboard, public app: App) {
    
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
  }
  ionViewWillLeave(){
    if(this.chatNotification){
      this.chatNotification.unsubscribe()
    }
  }
}
