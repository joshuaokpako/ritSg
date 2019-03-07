import { NgModule, ErrorHandler, Injectable, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geofence } from '@ionic-native/geofence';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GoogleMaps } from "@ionic-native/google-maps";
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { Firebase } from '@ionic-native/firebase'
import { Keyboard } from '@ionic-native/keyboard';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer } from '@ionic-native/file-transfer';
import { FileChooser } from '@ionic-native/file-chooser';
import { DocumentPicker } from '@ionic-native/document-picker';
import { FilePath } from '@ionic-native/file-path';
import { AppMinimize } from '@ionic-native/app-minimize';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Badge } from '@ionic-native/badge';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';


import { MyApp } from './app.component';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { FormsModule }   from '@angular/forms';



import { NgCalendarModule  } from 'ionic2-calendar';
import { AngularFireModule } from 'angularfire2';
import { UserserviceProvider } from '../providers/userservice/userservice';
import { Pro } from '@ionic/pro';
import { ChatServiceProvider } from '../providers/chat-service/chat-service';
import { FirestoreProvider } from '../providers/firestore/firestore';
import { FcmProvider } from '../providers/fcm/fcm';

Pro.init('119FE586', {
  appVersion: '0.0.1'
})


const firebase = {
  apiKey: "AIzaSyDxK5orl78d6dtTSzBK8GPtraJzsx_COQE",
  authDomain: "rit-sg.firebaseapp.com",
  databaseURL: "https://rit-sg.firebaseio.com",
  projectId: "rit-sg",
  storageBucket: "rit-sg.appspot.com",
  messagingSenderId: "137730014280"
};

@NgModule({
  declarations: [MyApp],
  imports: [
    NgCalendarModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule // imports firebase/storage only needed for storage features
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    LocalNotifications,
    Geolocation,
    GoogleMaps,
    Camera,
    File,
    DocumentPicker,
    FileOpener,
    FileTransfer,
    Firebase,
    FcmProvider,
    FileChooser,
    Geofence,
    BarcodeScanner,
    Keyboard,
    DocumentPicker,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserserviceProvider,
    ChatServiceProvider,
    FirestoreProvider,
    FilePath,
    AppMinimize,
    BackgroundMode,
    Badge,
    LocationAccuracy,
    ScreenOrientation,
    SpinnerDialog
  ]
})


@Injectable()
export class AppModule implements ErrorHandler {
  ionicErrorHandler: IonicErrorHandler;

  constructor(injector: Injector) {
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
