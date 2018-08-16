import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { UserserviceProvider } from '../../providers/userservice/userservice';


@Injectable()
export class FcmProvider {

  constructor(
    public firebaseNative: Firebase,
    public db: FirestoreProvider,
    public uS: UserserviceProvider,
    private platform: Platform
  ) {}

  // Get permission from the user
  async getToken() { 
    let token;

  if (this.platform.is('android')) {
    token = await this.firebaseNative.getToken()
  } 

  if (this.platform.is('ios')) {
    token = await this.firebaseNative.getToken();
    await this.firebaseNative.grantPermission();
  } 
  
  return this.saveTokenToFirestore(token)
}


  // Save the token to firestore
  private saveTokenToFirestore(token) {
    if (!token || !this.uS.uid) return;
  
    const devicesRef = this.db.col('devices')
  
    const docData = { 
      token,
      userId: this.uS.uid,
    }
  
    return devicesRef.doc(token).set(docData)
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen()
  }

}
