import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as CryptoJS from 'crypto-js';
admin.initializeApp();


exports.newMessageNotification = functions.firestore
    .document('messages/{mesKey}/chats/{mesId}')
    .onCreate(async (snap, context) => {
      const db = admin.firestore()  
    const data = snap.data();

    const name = data.sentBy
    const uid = data.sentTo
    const userId = data.uid
    const key = data.key
    const decryptMess = CryptoJS.AES.decrypt(data.message, key ).toString(CryptoJS.enc.Utf8);
    const message  = decryptMess.length > 100 ? decryptMess.slice(0, 100) + '...' : decryptMess

    // Notification content
    const payload = {
      notification: {
          title: `${name} sent a message!`,
          body:  message,
          icon: 'https://goo.gl/Fz9nrQ',
          sound: 'default',
          },
      data: { 
          userId: userId,
          type : 'message' 
          }
    }

    // ref to the device collection for the user
    const devicesRef = db.collection('devices').where('userId', '==', uid)


    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    const tokens = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;

      tokens.push( token )
    })

    return admin.messaging().sendToDevice(tokens, payload)

});