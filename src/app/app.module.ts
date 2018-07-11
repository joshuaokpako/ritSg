import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MyApp } from './app.component';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { LoginPage } from '../pages/login/login';
import { FeedsPage} from '../pages/feeds/feeds';
import { PlannerPage } from '../pages/planner/planner';
import { ChatsPage } from '../pages/chats/chats';
import { ProfilePage } from '../pages/profile/profile';
import { HomePage } from '../pages/home/home';
import { CoverPage } from '../pages/cover/cover';
import { RegisterPage } from '../pages/register/register';
import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { NgCalendarModule  } from 'ionic2-calendar';
import { AngularFireModule } from 'angularfire2';
import { UserserviceProvider } from '../providers/userservice/userservice';


const firebase = {
  apiKey: "AIzaSyDxK5orl78d6dtTSzBK8GPtraJzsx_COQE",
  authDomain: "rit-sg.firebaseapp.com",
  databaseURL: "https://rit-sg.firebaseio.com",
  projectId: "rit-sg",
  storageBucket: "rit-sg.appspot.com",
  messagingSenderId: "137730014280"
};

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    FeedsPage,
    PlannerPage,
    HomePage,
    ChatsPage,
    CoverPage,
    RegisterPage,
    TabsPage,
    ProfilePage,
    EventsPage
  ],
  imports: [
    NgCalendarModule,
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebase),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule // imports firebase/storage only needed for storage features
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    FeedsPage,
    PlannerPage,
    HomePage,
    ChatsPage,
    CoverPage,
    RegisterPage,
    TabsPage,
    ProfilePage,
    EventsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserserviceProvider
  ]
})
export class AppModule {}
