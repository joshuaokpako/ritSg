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
    // Notification content
    const payload = {
        notification: {
            title: `${name} sent a message!`,
            body: message,
            icon: 'https://goo.gl/Fz9nrQ',
            sound: 'default',
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
    return admin.messaging().sendToDevice(tokens, payload);
}));
//# sourceMappingURL=index.js.map