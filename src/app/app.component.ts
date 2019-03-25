import { Component,ViewChild} from '@angular/core';
import { Platform, Events, NavController, App, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { FcmProvider } from '../providers/fcm/fcm';
import { ToastController } from 'ionic-angular';
import { AppMinimize } from '@ionic-native/app-minimize';
import { tap } from 'rxjs/operators';
import { UserserviceProvider } from '../providers/userservice/userservice';
import { Badge } from '@ionic-native/badge';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  @ViewChild('myNav') nav: NavController
  notifyToast =true;
  chatId="";
  Fcm;
  timer = 0; // timer for splash screen
  currentUser;
  constructor(private screenOrientation: ScreenOrientation,public app: App,private badge: Badge,public events: Events, public uS : UserserviceProvider,modalCtrl: ModalController, platform: Platform, statusBar: StatusBar,  fcm: FcmProvider, toastCtrl: ToastController, private appMinimize: AppMinimize) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      
      //prevent screen from rotating when app is opened
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      statusBar.styleBlackTranslucent();
      let splash = modalCtrl.create('SplashPage');
      splash.present();
      setTimeout(() => {
        this.timer =4; 
      }, 4000);
     
      let n = 0
      // Check if user is authenticated
      uS.fireAuth.authState.subscribe(user => {
        if (user) {
          this.currentUser = user;
          if(user.isAnonymous){
            this.rootPage = 'HomePage';
            if (this.timer===4){
              splash.dismiss();
            }
          }
          else if(!user.emailVerified){
            let myuser = this.uS.user
            events.publish('get User',myuser)
            myuser.subscribe(theuser => {
              if (theuser) {
                if (theuser.type == 'club') {
                  if(theuser.emailVerified){
                    fcm.getToken().then(()=>{
                            this.rootPage = 'TabsPage';
                            this.Fcm = fcm.listenToNotifications().pipe(
                              tap(msg => {
                                console.log('true')
                                if(msg.wasTapped){
                                  console.log('tapped')
                                  this.nav.push('ChatsPage');
                                }
                                else{
                                if(this.notifyToast == true && this.chatId != msg.userId){
                                    // show a toast
                                    const toast = toastCtrl.create({
                                      message: msg.title,
                                      duration: 5000,
                                      position: "top",
                                    });
                                    toast.present();
                                  }
                                }
                              })
                              
                            ).subscribe()
                            if (this.timer===4){
                              splash.dismiss();
                            }
                          
                    })
                    
                  }
                  else{
                    this.rootPage = 'VerifyPage';
                    if (this.timer===4){
                      splash.dismiss();
                    }
                  }
                }
                else{
                  this.rootPage = 'VerifyPage';
                  if (this.timer===4){
                    splash.dismiss();
                  }
                }
              }
              else{
                this.rootPage = 'CoverPage';
                if (this.timer===4){
                  splash.dismiss();
                }
              }
            });
            
          }
          else{
            fcm.getToken().then(()=>{
                  this.rootPage = 'TabsPage';
                  this.Fcm = fcm.listenToNotifications().pipe(
                    tap(msg => {
                      console.log('true')
                      if(msg.wasTapped){
                        console.log('tapped')
                        this.nav.push('ChatsPage');
                      }
                      else{
                      if(this.notifyToast == true && this.chatId != msg.userId){
                          // show a toast
                          const toast = toastCtrl.create({
                            message: msg.title,
                            duration: 5000,
                            position: "top",
                          });
                          toast.present();
                        }
                        else{
                          this.rootPage = 'TabsPage';
                          this.Fcm = fcm.listenToNotifications().pipe(
                            tap(msg => {
                              console.log('true')
                              if(msg.wasTapped){
                                console.log('tapped')
                                this.nav.push('ChatsPage');
                              }
                              else{
                              if(this.notifyToast == true && this.chatId != msg.userId){
                                  // show a toast
                                  const toast = toastCtrl.create({
                                    message: msg.title,
                                    duration: 5000,
                                    position: "top",
                                  });
                                  toast.present();
                                }
                              }
                            })
                            
                          ).subscribe()
                          if (this.timer===4){
                            splash.dismiss();
                            
                          }
                        }
                      }
                    })
                    
                  ).subscribe()
            
            events.subscribe('chat entered', (entered,id) => {
              this.notifyToast = entered
              this.chatId = id;
              this.badge.clear();
            });
            
            // for increasing badge number on new chat
            events.subscribe('notif', (badgeNumber) => {
              this.badge.set(badgeNumber);
            });
            
          }) 
        }
      }
        else {
          n+= 1;
          if(this.Fcm){
            this.Fcm.unsubscribe()
          }
          if(n==1){
            this.rootPage  = 'CoverPage';
          }
          if (this.timer===4){
            splash.dismiss();
          }
        }
      })
      
      /*if(this.currentUser){
        uS.updateUserActivity('online')
      }*/
      
    });
    
    platform.pause.subscribe(()=>{
      uS.updateUserActivity('offline')
    })

    platform.resume.subscribe((res) => {
      uS.updateUserActivity('online')
  });
    
    platform.registerBackButtonAction(() => {
      let nav = this.app.getActiveNavs()[0];
      if (nav.canGoBack()) {
        nav.pop(); // If called very fast in a row, pop will reject because no pages
      }
      else{
        this.appMinimize.minimize();
      }
    }, 500);
  }

  
 
}
