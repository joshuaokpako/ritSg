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
    this.sgEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'SG Events'))
    this.ritEvents= this.db.col$("events", ref => ref.where('type', '==', 'RIT Events'))
    this.comHEvents= this.db.col$("events", ref => ref.where('type', '==', 'Common Hour Events'))
    this.otherEvents= this.db.col$("events", ref => ref.where('type', '==', 'Other Events'))
    this.sugEvents= this.db.col$("events", ref => ref.where('type', '==', 'Suggested Events'))
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
        this.uid = user.uid;
        this.userRef = this.db.doc('users/'+this.uid).ref
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

        this.userName = cUser.displayName;
        this.userEmail = cUser.email;
        this.uid = cUser.uid;
        this.userRef = this.db.doc('users/'+this.uid).ref
        this.user = this.getUserProfile(this.uid)
        
        cUser.updateProfile({
          displayName: account['fullName'],
          photoURL: url
        })
        .then((adduser) => {
          this.db.set('users/'+cUser.uid, account)
          this.userPhotoUrl = cUser.photoURL;
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

  getJob(){
    return this.db.col$('jobs', ref => ref.orderBy('createdAt','desc'))
  }

  getFeed(){
    return this.db.col$('feeds', ref => ref.orderBy('createdAt','desc'))
  }

  getFaculty(){
    return this.db.col$('users', ref => ref.where('staff', '==', true))
  }

  getDepartments(){
    return this.db.col$('RIT Departments', ref => ref.orderBy('department','asc'))
  }

  getEventFeedback(evId) {
    return this.db.col$("events/"+evId +"/feedbacks", ref => ref.orderBy('createdAt','asc'))
  }

  updateEventGoing(ev){
    let plannerEvent = { 
      startTime: ev.plannerStartTime, 
      endTime: ev.plannerEndTime, 
      allDay: false, 
      title:ev.title, 
      eventType:'public', 
      eventRef:this.db.doc("users/"+this.uid+"/event/"+ev.id).ref,
      rating:0
    }
    let event ={
      going:ev.going
    }
    return  this.db.update("events/"+ev.id,event).then(()=>{
      if(ev.youGoing ==false){
        this.db.set("users/"+this.uid+"/event/"+ev.id,plannerEvent)
      }
      else{
        this.db.delete("users/"+this.uid+"/event/"+ev.id)
      }
    })
  }

  addJob(job){
    return  this.db.add("jobs",job)
  }

  addFeed(feed){
    return  this.db.add("feeds",feed)
  }

  addComment(comment, evId){
    let feedback ={
      comment: comment,
      userRef: this.userRef
    }
    return this.db.add("events/"+evId +"/feedbacks",feedback).then(()=>{
      let sub = this.db.col$("events/"+evId +"/feedbacks").subscribe((x)=>{
        console.log(x.length)
        let event ={
          feedback: x.length
        }
        this.db.update("events/"+evId,event)
      })
    
    })
  }

  addEvent(event,date,start,end){
    let eventDate=  moment(date).format('MMMM DD YYYY');
    event['postedBy'] = this.db.doc('users/'+this.uid).ref;
    event['eventDate'] = eventDate
    event['startTime'] = moment(start).format('hh mm A')
    event['plannerStartTime'] = eventDate + ' ' + start
    event['plannerEndTime'] = eventDate + ' ' + end
    event['endTime'] = moment(end).format('hh mm A')
  
    return  this.db.add("events",event)
  }

  saveMyEvents(event){
    return  this.db.set("users/"+this.uid+"/event",event)

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
      }
      return this.db.add("RIT Athletics",athletics);
      case "RIT Clubs":
      let club={
        about: description,
        clubPhoto: profilePic,
        name:groupName,
        type:type
      }
      return this.db.add("RIT Clubs",club);
      case "RIT Deals":
        let deals={
          about: description,
          image: profilePic,
          name: groupName,
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
