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
    
    const chatRef = db.collection('users').where('uid', '==', uid)

    const chats = await chatRef.get(); // for knowing if the reciever is in the chat
    let chat = '';

    chats.forEach(result => {
      chat = result.data().chatactivity;
    })

    // Notification content
    const payload = {
      notification: {
          title: name,
          body:  message,
          icon: 'https://goo.gl/Fz9nrQ',
          sound: 'default',
          click_action: "FCM_PLUGIN_ACTIVITY"
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

    if(chat!==userId){
      return admin.messaging().sendToDevice(tokens, payload)
    }
    else{
      return ''
    }

});
exports.newEventNotification = functions.firestore
    .document('events/{eventKey}/{eventName}/{newEventId}')
    .onCreate(async (snap, context) => {
    const db = admin.firestore()  
    const data = snap.data();

    const type = data.type
    const title = data.title
   
    const payload = {
		notification: {
		  title: type,
		  body: title,
		  icon: 'https://goo.gl/Fz9nrQ',
		  sound: 'default',
		  click_action: "FCM_PLUGIN_ACTIVITY"
		  },
		data: { 
          type : 'event' 
        }
    }

    // ref to the device collection for the user
    const devicesRef = db.collection('devices')


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
exports.newFeedNotification = functions.firestore
    .document('feeds/{feedKey}')
    .onCreate(async (snap, context) => {
    const db = admin.firestore()  
    const data = snap.data();

    const postedBy = data.postedBy.id;
    const nameRef = db.collection('users').where('uid', '==', postedBy)

    const names = await nameRef.get();
    let name = '';

    names.forEach(result => {
       name = result.data().fullName;
    })

    const message = `${name} added a new feed`
   
    const payload = {
      notification: {
          title: name ,
          body: message,
          icon: 'https://goo.gl/Fz9nrQ',
          sound: 'default',
          click_action: "FCM_PLUGIN_ACTIVITY"
          },
		data: { 
          type : 'feed' 
        }
    }

    // ref to the device collection for the user
    const devicesRef = db.collection('devices')


    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    const tokens = [];

    // send a notification to each device token
    devices.forEach(result => {
      if(result.data().userId!== postedBy){
        const token = result.data().token;
        tokens.push( token )
      }

      
    })

    
    return admin.messaging().sendToDevice(tokens, payload)
});

exports.newJobNotification = functions.firestore
    .document('jobs/{jobKey}')
    .onCreate(async (snap, context) => {
    const db = admin.firestore()  
    const data = snap.data();
    const compName = data.companyName;
    const postedBy = data.postedBy.id;
    const message = `New Job from ${compName}`
   
    const payload = {
      notification: {
          title: compName ,
          body: message,
          icon: 'https://goo.gl/Fz9nrQ',
          sound: 'default',
          click_action: "FCM_PLUGIN_ACTIVITY"
          },
		data: { 
          type : 'job' 
        }
    }

    // ref to the device collection for the user
    const devicesRef = db.collection('devices')


    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    const tokens = [];

    // send a notification to each device token
    devices.forEach(result => {
      if(result.data().userId!== postedBy){
        const token = result.data().token;
        tokens.push( token )
      }

      
    })

    
    return admin.messaging().sendToDevice(tokens, payload)
});

exports.newFeedLikeNotification = functions.firestore
    .document('feeds/{feedKey}')
    .onUpdate(async (change, context) => {
    const db = admin.firestore()  
    const dataAfter = change.after.data();
    const dataBefore = change.before.data();
    const likesAfter = dataAfter.likes
    const likesBefore = dataBefore.likes

    const pwl = likesAfter[(likesAfter.length)-1].id //personWhoLiked
    const pwlNamesRef = db.collection('users').where('uid', '==', pwl);
    const postedBy = dataBefore.postedBy.id;

    const pwl_names = await pwlNamesRef.get();
    let pwl_name = '';


    pwl_names.forEach(result => {
      pwl_name = result.data().fullName;
   })

    const message = `${pwl_name} liked your post`
   
    const payload = {
      notification: {
          title: pwl_name ,
          body: message,
          icon: 'https://goo.gl/Fz9nrQ',
          sound: 'default',
          click_action: "FCM_PLUGIN_ACTIVITY"
          },
		data: { 
          type : 'feedlike' 
        }
    }

    // ref to the device collection for the user
    const devicesRef = db.collection('devices').where('userId', '==', postedBy)


    // get the user's tokens and send notifications
    const devices = await devicesRef.get();

    const tokens = [];

    // send a notification to each device token
    devices.forEach(result => {
      const token = result.data().token;

      tokens.push( token )

      
    })
    if(likesAfter.length > likesBefore.length){
      return admin.messaging().sendToDevice(tokens, payload)
    }
    else{
      return '';
    }
});
