import { Component, ViewChild ,ErrorHandler, Injectable, Injector } from '@angular/core';
import { Platform, IonicErrorHandler  } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CoverPage } from '../pages/cover/cover';


import { Pro } from '@ionic/pro';

Pro.init('119FE586', {
  appVersion: '0.0.1'
})

@Injectable()




@Component({
  templateUrl: 'app.html'
})
export class MyApp implements ErrorHandler{
  rootPage:any = CoverPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen,injector: Injector) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    try {
      this.ionicErrorHandler = injector.get(IonicErrorHandler);
    } catch(e) {
      // Unable to get the IonicErrorHandler provider, ensure
      // IonicErrorHandler has been added to the providers list below
    }
  }

  handleError(err: any): void {
    Pro.monitoring.handleNewError(err);
    // Remove this if you want to disable Ionic's auto exception handling
    // in development mode.
    this.ionicErrorHandler && this.ionicErrorHandler.handleError(err);
  }
}
