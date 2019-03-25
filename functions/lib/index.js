"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const CryptoJS = require("crypto-js");
admin.initializeApp();
exports.newMessageNotification = functions.firestore
    .document('messages/{mesKey}/chats/{mesId}')
    .onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const db = admin.firestore();
    const data = snap.data();
    const name = data.sentBy;
    const uid = data.sentTo;
    const userId = data.uid;
    const key = data.key;
    const decryptMess = CryptoJS.AES.decrypt(data.message, key).toString(CryptoJS.enc.Utf8);
    const message = decryptMess.length > 100 ? decryptMess.slice(0, 100) + '...' : decryptMess;
    const chatRef = db.collection('users').where('uid', '==', uid);
    const chats = yield chatRef.get(); // for knowing if the reciever is in the chat
    let chat = '';
    chats.forEach(result => {
        chat = result.data().chatactivity;
    });
    // Notification content
    const payload = {
        notification: {
            title: name,
            body: message,
            icon: 'https://goo.gl/Fz9nrQ',
            sound: 'default',
            click_action: "FCM_PLUGIN_ACTIVITY"
        },
        data: {
            userId: userId,
            type: 'message'
        }
    };
    // ref to the device collection for the user
    const devicesRef = db.collection('devices').where('userId', '==', uid);
    // get the user's tokens and send notifications
    const devices = yield devicesRef.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        const token = result.data().token;
        tokens.push(token);
    });
    if (chat !== userId) {
        return admin.messaging().sendToDevice(tokens, payload);
    }
    else {
        return '';
    }
}));
exports.newEventNotification = functions.firestore
    .document('events/{eventKey}/{eventName}/{newEventId}')
    .onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const db = admin.firestore();
    const data = snap.data();
    const type = data.type;
    const title = data.title;
    const payload = {
        notification: {
            title: type,
            body: title,
            icon: 'https://goo.gl/Fz9nrQ',
            sound: 'default',
            click_action: "FCM_PLUGIN_ACTIVITY"
        }
    };
    // ref to the device collection for the user
    const devicesRef = db.collection('devices');
    // get the user's tokens and send notifications
    const devices = yield devicesRef.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        const token = result.data().token;
        tokens.push(token);
    });
    return admin.messaging().sendToDevice(tokens, payload);
}));
exports.newFeedNotification = functions.firestore
    .document('feeds/{feedKey}')
    .onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const db = admin.firestore();
    const data = snap.data();
    const postedBy = data.postedBy.id;
    const nameRef = db.collection('users').where('uid', '==', postedBy);
    const names = yield nameRef.get();
    let name = '';
    names.forEach(result => {
        name = result.data().fullName;
    });
    const message = `${name} added a new feed`;
    const payload = {
        notification: {
            title: name,
            body: message,
            icon: 'https://goo.gl/Fz9nrQ',
            sound: 'default',
            click_action: "FCM_PLUGIN_ACTIVITY"
        }
    };
    // ref to the device collection for the user
    const devicesRef = db.collection('devices');
    // get the user's tokens and send notifications
    const devices = yield devicesRef.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        if (result.data().userId !== postedBy) {
            const token = result.data().token;
            tokens.push(token);
        }
    });
    return admin.messaging().sendToDevice(tokens, payload);
}));
exports.newJobNotification = functions.firestore
    .document('jobs/{jobKey}')
    .onCreate((snap, context) => __awaiter(this, void 0, void 0, function* () {
    const db = admin.firestore();
    const data = snap.data();
    const compName = data.companyName;
    const postedBy = data.postedBy.id;
    const message = `New Job from ${compName}`;
    const payload = {
        notification: {
            title: compName,
            body: message,
            icon: 'https://goo.gl/Fz9nrQ',
            sound: 'default',
            click_action: "FCM_PLUGIN_ACTIVITY"
        }
    };
    // ref to the device collection for the user
    const devicesRef = db.collection('devices');
    // get the user's tokens and send notifications
    const devices = yield devicesRef.get();
    const tokens = [];
    // send a notification to each device token
    devices.forEach(result => {
        if (result.data().userId !== postedBy) {
            const token = result.data().token;
            tokens.push(token);
        }
    });
    return admin.messaging().sendToDevice(tokens, payload);
}));
//# sourceMappingURL=index.js.map