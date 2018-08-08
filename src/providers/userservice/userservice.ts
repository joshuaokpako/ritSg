import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { AngularFireStorage} from 'angularfire2/storage'
import { Observable } from 'rxjs';
import * as moment from 'moment';



export interface User{
  fullName:string;
  email:string;
  admin:string;
}



/*
  Generated class for the UserserviceProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserserviceProvider {

  public data: any;
  public fireAuth: any;
  public userProfile: any;
  public currentUser:any;
  public myObservable:any;
  public userName:any;
  public userEmail:any;
  public userPhotoUrl:any;
  public theDb:any;
  public sgEvents;
  public ritEvents;
  public comHEvents;
  public otherEvents;
  public sugEvents:Observable<any>;
  public uid:string;
  events: Observable<any>;
  clubs: Observable<any>;
  deals: Observable<any>;
  athletics: Observable<any>;
  users: Observable<any>;
  public user;
  public userRef;
  

  constructor(private storage: AngularFireStorage,public http: HttpClient,private firebaseauth:AngularFireAuth,public db:FirestoreProvider) { 
    this.fireAuth = this.firebaseauth;
    //get user data
    
    this.users = this.db.col$("users");
    // get clubs data
    this.clubs = this.db.col$("clubs");
    // get deals data
    this.deals = this.db.col$("RIT Deals");
    //get athletics data
    this.athletics = this.db.col$("RIT Athletics");
    //get events data
    
    this.events = this.db.col$("events");
    this.sgEvents= this.db.col$("events", ref => ref.where('type', '==', 'SG Events'))
    this.ritEvents= this.db.col$("events", ref => ref.where('type', '==', 'RIT Events'))
    this.comHEvents= this.db.col$("events", ref => ref.where('type', '==', 'Common Hour Events'))
    this.otherEvents= this.db.col$("events", ref => ref.where('type', '==', 'Other Events'))
    this.sugEvents= this.db.col$("events", ref => ref.where('type', '==', 'Suggested Events'))
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
        this.uid =user.uid;
        this.user = this.getUserProfile(this.uid)
    
      } 
    })
    
}



  loginUserService(email: string, password: string): any {
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password);
  }


  signUpUserService(account:User, password){
    return this.fireAuth.auth.createUserWithEmailAndPassword(account['email'], password)
    .then((newUser) => {
      //sign in the user
      this.fireAuth.auth.signInWithEmailAndPassword(account['email'], password)
      .then((updateProfile) =>{
        var cUser = this.fireAuth.auth.currentUser;
        let url = "https://firebasestorage.googleapis.com/v0/b/rit-sg.appspot.com/o/profilePics%2Fblank-profile-picture.png?alt=media&token=99cf5b81-e1de-4778-912f-885e860142f8"
        account['photoUrl'] = url
        account['uid'] = cUser.uid
        account['groupAdmin'] = []
        //account['profilePicRef']= 'profilePics/'+account['fullName']+'/'+cUser.uid
        cUser.updateProfile({
          displayName: account['fullName'],
          photoUrl: url
        })
        .then((adduser) => {
          this.db.set('users/'+cUser.uid, account)
        })
      })
    })
  }
 
  signOut(){
    return this.fireAuth.auth.signOut();
  }
 
  uploadImages(filePath){
    return this.storage.ref(filePath)
  }

  addEvent(eventType,title,description,img,eventDate){
    let event={
      description: description,
      eventDate: moment(eventDate).format('MMMM DD YYYY, h:mm a'),
      likes:"",
      postTime: this.db.timestamp,
      postDetails:{
        postedById:this.uid,
        postedByName:this.userName ,
        postedByPhotoUrl:this.userPhotoUrl
      },
      postImg:img,
      title:title,
      type:eventType
    }
   return  this.db.add("events",event)
  }

  saveMyEvents(event){
    return  this.db.add("users/"+this.uid+"/event",event)

  }

  getMyEvents(){
    return this.db.col$("users/"+this.uid+"/event")
  }

  addGroup(header,groupName,description,profilePic,type?,location?,deal?){
    switch (header) {
      case "RIT Athletics":
      let athletics={
        about: description,
        photo: profilePic,
        name: groupName,
        timePosted: this.db.timestamp,
      }
      return this.db.add("RIT Athletics",athletics);
      case "RIT Clubs":
      let club={
        about: description,
        clubPhoto: profilePic,
        name:groupName,
        timePosted:this.db.timestamp,
        type:type
      }
      return this.db.add("RIT Clubs",club);
      case "RIT Deals":
        let deals={
          about: description,
          image: profilePic,
          name: groupName,
          timePosted: this.db.timestamp,
          location: location,
          deal: deal
        }
        return this.db.add("RIT Deals",deals);
      default:
        break;
    }
  }

  getUserProfile(uid){
   return this.db.doc$('users/'+uid)
   
  }

}
