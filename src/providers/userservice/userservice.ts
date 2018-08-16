import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { AngularFireStorage} from 'angularfire2/storage'
import { Geofence } from '@ionic-native/geofence';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  

  constructor(private geofence: Geofence,private storage: AngularFireStorage,public http: HttpClient,private firebaseauth:AngularFireAuth,public db:FirestoreProvider) { 
    /*geofence.initialize().then(
      // resolved promise does not return a value
      () => {
        this.addGeofence()
        this.geofence.onTransitionReceived().subscribe(()=>{
          geofence.TransitionType.toString()
          console.log(geofence.TransitionType.toString())
        })
      },
      (err) => console.log(err)
    )
    */
    this.fireAuth = this.firebaseauth;
    //get user data
    
    this.users = this.db.col$("users", ref => ref.orderBy('fullName','asc'));
    // get clubs data
    this.clubs = this.db.col$("clubs", ref => ref.orderBy('name','asc'));
    // get deals data
    this.deals = this.db.col$("RIT Deals", ref => ref.orderBy('name','asc'));
    //get athletics data
    this.athletics = this.db.col$("RIT Athletics", ref => ref.orderBy('name','asc'));
    //get events data
    
    this.events = this.db.col$("events");
    this.sgEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'SG Events'))
    this.ritEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'RIT Events'))
    this.comHEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'Common Hour Events'))
    this.otherEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'Other Events'))
    this.sugEvents= this.db.colWithIds$("events", ref => ref.where('type', '==', 'Suggested Events'))
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
        this.uid = user.uid;
        this.userRef = this.db.doc('users/'+this.uid).ref
        this.user = this.getUserProfile(this.uid)
    
      } 
    })
    
}

updateProfileName(name){
  
  this.currentUser.updateProfile({
    displayName: name.fullName
  })
  .then((adduser) => {
    this.db.update('users/'+this.uid, name)
    this.userName= name.fullName;
  })

}
updateProfilePic(photo){
  return this.currentUser.updateProfile({
    photoURL: photo.photoUrl
  })
  .then((adduser) => {
    this.db.update('users/'+this.uid, photo)
    this.userPhotoUrl= photo.photoUrl;
  })

}

/*private addGeofence() {
  //options describing geofence
  let fence = {
    id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
    latitude:       37.285951, //center of geofence radius
    longitude:      -121.936650,
    radius:         100, //radius to edge of geofence in meters
    transitionType: 3, //see 'Transition Types' below
    notification: { //notification settings
        id:             1, //any unique ID
        title:          'You crossed a fence', //notification title
        text:           'You just arrived to Gliwice city center.', //notification body
        openAppOnClick: true //open app when notification is tapped
    }
  }

  this.geofence.addOrUpdate(fence).then(
     () => console.log('Geofence added'),
     (err) => console.log('Geofence failed to add')
   );
}
*/
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
    return this.db.colWithIds$('feeds', ref => ref.orderBy('createdAt','desc'))
  }

  getBooks(){
    return this.db.colWithIds$('users/'+this.uid+'/books', ref => ref.orderBy('createdAt','desc'))
  }
   
  getMyFeed(){
    return this.db.colWithIds$('feeds', ref => ref.where('postedByUid', '==',this.uid ))
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

  getFeedsComment(evId) {
    return this.db.col$("feeds/"+evId +"/comments", ref => ref.orderBy('createdAt','asc'))
  }

  getPersonalEvents(){ // for profile page
     return this.db.colWithIds$("users/"+this.uid+"/event", ref => ref.where('eventType', '==',"public")).pipe(
      map((event:any)=>{
      event.forEach(myelement => {
        this.getRef(myelement.eventRef).subscribe(x=>{
          myelement.eventRef = x
          if(myelement.eventRef.postedBy){
          this.getRef(myelement.eventRef.postedBy).subscribe(output=>{
            myelement.eventRef.postedBy =output
          }) 
        }
              myelement.youGoing = true;
        })
        
      })
         
      return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
    })
  )
  }

  getMyEvents(){ // for planner page
    return this.db.col$("users/"+this.uid+"/event")
  }

  getUserProfile(uid){
    return this.db.doc$('users/'+uid)
    
   }
   
  updateFeedLike(fd){
    let feed ={
      likes:fd.likes
    }
    return  this.db.update("feeds/"+fd.id,feed)
  }

  updateEventGoing(ev){
    let plannerEvent = { 
      startTime: ev.plannerStartTime, 
      endTime: ev.plannerEndTime, 
      allDay: false, 
      title:ev.title, 
      eventType:'public', 
      eventRef:this.db.doc("events/"+ev.id).ref,
      rating:0
    }
    let event ={
      going:ev.going
    }
    return  this.db.update("events/"+ev.id,event).then(()=>{
      if(!ev.youGoing){
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
  addBooks(book){
    return  this.db.add("books",book)
  }

  addComment(comment, evId, header){
    let type;
    let destination;
    let feedback ={
      comment: comment,
      userRef: this.userRef
    }
    if(header=="Feedbacks"){
      type = "events/"
      destination ="/feedbacks"
    }
    else{
      type = "feeds/"
      destination ="/comments"
    }
    return this.db.add(type+evId +destination,feedback).then(()=>{
      let sub = this.db.col$(type+evId +destination).subscribe((x)=>{
        // Update comment count if source is feedback else if source is comment
        let event ={}
        if(header=="Feedbacks"){
            event ={
            feedback: x.length
          }
        }
        else{
          event ={
            comment: x.length
          }
        }
        this.db.update(type+evId,event)
      })
    
    })
  }

  getRef(value:any) {
    return this.db.doc$(value.path)
  }

  addEvent(event,date,start,end){
    let eventDate=  moment(date).format('MM/DD/YYYY');
    event['postedBy'] = this.db.doc('users/'+this.uid).ref;
    event['eventDate'] =  moment(date).format('MMMM DD YYYY');
    event['startTime'] = moment( date +' '+ start).format('hh:mm A')
    event['plannerStartTime'] = moment(eventDate + ' ' + start).format('LLLL')
    event['plannerEndTime'] = moment(eventDate + ' ' + end).format('LLLL')
    event['endTime'] = moment(date +' '+ end).format('hh:mm A')
  
    return  this.db.add("events",event)
  }

  saveMyEvents(event){
    return  this.db.set("users/"+this.uid+"/event",event)

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
      const geopoint = this.db.geopoint(location.latitude, location.longitude)
        let deals={
          about: description,
          image: profilePic,
          name: groupName,
          location: geopoint,
          deal: deal
        }
        return this.db.add("RIT Deals",deals);
      default:
        break;
    }
  }

 

}
