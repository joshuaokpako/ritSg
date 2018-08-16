import { Component, ViewChild} from '@angular/core';
import { Platform  } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { CoverPage } from '../pages/cover/cover';
import { FcmProvider } from '../providers/fcm/fcm';
import { ToastController } from 'ionic-angular';
import { Geofence } from '@ionic-native/geofence';
import { tap } from 'rxjs/operators';







@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = CoverPage;
  constructor(private geofence: Geofence, platform: Platform, statusBar: StatusBar,  fcm: FcmProvider, toastCtrl: ToastController) {
    platform.ready().then(() => {
      

      
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // Listen to incoming messages
      fcm.listenToNotifications().pipe(
        tap(msg => {
          console.log('it is working')
          console.log(msg)
          // show a toast
          const toast = toastCtrl.create({
            message: msg.body,
            duration: 5000
          });
          toast.present();
        })
      )
      .subscribe()
      statusBar.styleBlackTranslucent();
     
    });
    
  }


 
}
