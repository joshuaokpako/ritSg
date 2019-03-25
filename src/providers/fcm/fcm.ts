import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FCM } from '@ionic-native/fcm';


@Injectable()
export class FcmProvider {
token: string ='';
  constructor(
    public firebaseNative: Firebase,
    public db: FirestoreProvider,
    public uS: UserserviceProvider,
    private platform: Platform,
    public fcm: FCM
  ) {}

  // Get permission from the user
  async getToken() { 
    let token= "";

  if (this.platform.is('android')) {
    token = await this.fcm.getToken()
    
  } 

  if (this.platform.is('ios')) {
    token = await this.fcm.getToken();
    await this.firebaseNative.grantPermission();
  } 
  this.token = token;
  
  return this.saveTokenToFirestore(token)
  
}

  // Save the token to firestore
  private saveTokenToFirestore(token) {
    if (token=='' || !this.uS.uid) return;
  
    
  
    const docData = { 
      token,
      userId: this.uS.uid
    }
    this.fcm.onTokenRefresh().subscribe(token => {
      this.db.set("devices/"+token,docData)
    });
    return this.db.set("devices/"+token,docData)
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
    return this.fcm.onNotification()
    
  }

  

 

}
