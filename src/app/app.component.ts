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



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;
  @ViewChild('myNav') nav: NavController
  notifyToast =true;
  chatId="";
  fcm;
  constructor(private screenOrientation: ScreenOrientation,public app: App,private badge: Badge,public events: Events, public uS : UserserviceProvider,modalCtrl: ModalController, platform: Platform, statusBar: StatusBar,  fcm: FcmProvider, toastCtrl: ToastController, private appMinimize: AppMinimize) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      
      
      //prevent screen from rotating when app is opened
      this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      
      // Check if user is authenticated
      uS.fireAuth.authState.subscribe(user => {
        if (user) {
          if(user.isAnonymous){
            this.rootPage = 'HomePage';
          }
          else if(!user.emailVerified){
            let myuser = this.uS.user
            console.log(myuser)
            events.publish('get User',myuser)
            myuser.subscribe(theuser => {
              if (theuser) {
                if (theuser.type == 'club') {
                  if(theuser.emailVerified){
                    this.rootPage = 'TabsPage';
                  }
                  else{
                    this.rootPage = 'VerifyPage';
                  }
                }
                else{
                  this.rootPage = 'VerifyPage';
                }
              }
              else{
                this.rootPage = 'CoverPage';
              }
            });
            
          }
          else{
            this.rootPage = 'TabsPage';
            events.subscribe('chat entered', (entered,id) => {
              this.notifyToast = entered
              this.chatId = id;
              this.badge.clear();
            });
            
            // for increasing badge number on new chat
            events.subscribe('notif', (badgeNumber) => {
              this.badge.set(badgeNumber);
            });
            
            fcm.getToken()
            // Listen to incoming messages
            this.fcm = fcm.listenToNotifications().pipe(
              tap(msg => {
                if(msg.wasTapped){
                  console.log('tapped')
                  this.nav.setRoot('ChatsPage');
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
          } 
        }
        else {
          if(this.fcm){
            this.fcm.unsubscribe()
          }
          this.rootPage  = 'CoverPage';
  
        }
      })
      
      
      
      statusBar.styleBlackTranslucent();
      let splash = modalCtrl.create('SplashPage');
      splash.present();
     
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
