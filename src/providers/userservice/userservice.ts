import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { AngularFireStorage} from 'angularfire2/storage'
import { Observable, Subject} from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';






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
  emailVerified;
  public user;
  public userRef;
  public login= true;
  

  

  constructor(private storage: AngularFireStorage,public http: HttpClient,private firebaseauth:AngularFireAuth,public db:FirestoreProvider) { 
    
    this.fireAuth = this.firebaseauth;
    //get user data 
    
    this.users = this.db.col$("users", ref => ref.orderBy('fullName','asc'));
    // get clubs data
    this.clubs = this.db.colWithIds$("users", ref => ref.where('admin', '==','clubs'));
    // get deals data
    this.deals = this.db.col$("RIT Deals", ref => ref.orderBy('name','asc'));
    //get athletics data
    this.athletics = this.db.colWithIds$("users", ref => ref.where('admin', '==','athletics'));
    //get events data
    
    
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
        this.uid = user.uid;
        this.userRef = this.db.doc('users/'+this.uid).ref
        this.user = this.getUserProfile(this.uid)
        this.emailVerified = user.emailVerified;
    
      } 
      else{
        this.currentUser = '';
        this.userName = '';
        this.userEmail = '';
        this.userPhotoUrl = '';
        this.uid = '';
        this.userRef = ''
        this.user = ''
      }
    })
    
}
getEvents(name,y,doc,n){
  if (y === 0){
  return this.db.colWithIds$("events/"+name+"/"+name, ref => ref.orderBy('createdAt','desc').limit(n))
  }
  else{
    return this.db.colWithIds$("events/"+name+"/"+name, ref => ref.orderBy('createdAt','desc').startAfter(doc).limit(n))
  }
}

getUserRef(user){
  return this.db.doc('users/'+user).ref
}

checkDocExists(docCol,docId){
  console.log(docCol+docId)
 let doc= this.db.doc(docCol+docId).ref.get().then((docData) => {
    if (docData.exists) {
      // document exists (online/offline)
      return true
    } else {
      // document does not exist (only on online)
      return false
    }
  })
  return doc
}

updateClubEmailVerified(id) {
  let emailVerified ={
    emailVerified :true
  }
  return this.db.update('users/'+id, emailVerified)
}

updateProfileName(name){
  
  this.currentUser.updateProfile({
    displayName: name.fullName.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
  })
  .then((adduser) => {
    this.db.update('users/'+this.uid, name)
    this.userName= name.fullName.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
  })

}

updateDesc(desc){

  return this.db.update('users/'+this.uid, desc)
}

updateOffice(office){

  return this.db.update('users/'+this.uid, office)
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


  loginUserService(email: string, password: string): any {
    let n = 0;
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password).then(()=>{
      this.fireAuth.authState.subscribe(user => {
        if (user) {
          n+=1;
          this.currentUser = user;
          this.userName = user.displayName;
          this.userEmail = user.email;
          this.userPhotoUrl = user.photoURL;
          this.uid = user.uid;
          this.userRef = this.db.doc('users/'+this.uid).ref
          this.user = this.getUserProfile(this.uid)
          if (n==1){
            this.updateUserActivity('online')
          }
      
        }
        else{
          this.currentUser = '';
          this.userName = '';
          this.userEmail = '';
          this.userPhotoUrl = '';
          this.uid = '';
          this.userRef = ''
          this.user = ''
        }
      })
    })
    ;
  }

 encrypt(text){
  return CryptoJS.SHA256(text).toString();  
 }

 loginAnonymously(){
  return this.fireAuth.auth.signInAnonymously()
  }
  signUpUserService(account, password){
    return this.fireAuth.auth.createUserWithEmailAndPassword(account['email'], password)
    .then(() => {
      let n = 0;
      if(account['type']=='club') {
        var cUser = this.fireAuth.auth.currentUser;
        let url = account['photoUrl'];
          account['uid'] = cUser.uid
          account['groupAdmin'] = []
          cUser.updateProfile({
            displayName: account['fullName'],
            photoURL: url
          })
          .then(() => {
            this.db.set('users/'+cUser.uid, account)
            if(account['admin']==='athletics'){
              let athletics = {
                clubRef: this.db.doc('RIT Athletics/'+account['fullName']).ref
              }
              this.db.update('RIT Athletics/'+account['fullName'], athletics)
            }
            else{
              let club = {
                clubRef: this.db.doc('clubs/'+account['fullName']).ref
              }
              this.db.update('clubs/'+account['fullName'], club)
            }
            
          })
      }
      else{
        //sign in the user
        this.fireAuth.auth.signInWithEmailAndPassword(account['email'], password)
        .then((updateProfile) =>{
          this.login = false;
          var cUser = this.fireAuth.auth.currentUser;
          let user = this.db.firebase.auth().currentUser
          user.sendEmailVerification().then(() => {
            // Email sent.
            
            let url = account['photoUrl'];
            account['uid'] = cUser.uid
            account['groupAdmin'] = []
            //account['profilePicRef']= 'profilePics/'+account['fullName']+'/'+cUser.uid

            
            this.fireAuth.authState.subscribe(user => {
              if (user) {
                n+=1;
                this.currentUser = user;
                this.userName = user.displayName;
                this.userEmail = user.email;
                this.userPhotoUrl = user.photoURL;
                this.uid = user.uid;
                this.userRef = this.db.doc('users/'+this.uid).ref
                this.user = this.getUserProfile(this.uid)
                if (n==1){
                  console.log(n)
                  this.updateUserActivity('online')
                }
              }
              else{
                this.currentUser = '';
                this.userName = '';
                this.userEmail = '';
                this.userPhotoUrl = '';
                this.uid = '';
                this.userRef = ''
                this.user = ''
              }
            })
            
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
    })
  }
 
reauthenticateUser(oldPass,newPass){
  const credential = this.db.EmailAuth().credential(
    this.userEmail, 
    oldPass
);
  return this.currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(()=>{
    this.currentUser.updatePassword(newPass)
  })
}

  signOut(){
    return this.updateUserActivity('offline').then(()=>{
      this.fireAuth.auth.signOut();
    })
  }

  anonymousSignOut(){
    let user = this.db.firebase.auth().currentUser
    return user.delete().then(()=>{
      this.fireAuth.auth.signOut();
    }). catch(()=>{
      this.fireAuth.auth.signOut();
    })
  }
 
  checkStudentId(studentId){
   return this.db.colWithIds$("users", ref => ref.where('studentId', '==', studentId))
  }
  uploadImages(filePath){
    return this.storage.ref(filePath)
  }

  updateParking(type,enterLeave){
    return this.db.doc$('parking/'+type).subscribe((x:any)=>{
      let parking
      if(enterLeave == 'enter'){
         parking ={
          carsInParking: x.carParking +1
        }
      }
      else{
        parking ={
          carsInParking: x.carParking -1
        }
      }
      this.db.upsert('parking/'+type, parking)
    })
  }

  getBuses(type){
    return this.db.colWithIds$('buses/'+type+'/' +type, ref => ref.orderBy('destination','asc'));
  }

  getBus(type){ // for dorms and athletics buses
    return this.db.doc$('buses/'+type);
  }

  getUsersSpirit(){
    return this.db.colWithIds$("users", ref => ref.where('spiritPoints', '>',-1).orderBy('spiritPoints','desc'));
  }

  getJob(){
    return this.db.col$('jobs', ref => ref.orderBy('createdAt','desc'))
  }

  getFeed(y,doc,n){
    if (y === 0){
    return this.db.colWithIds$('feeds', ref => ref.orderBy('createdAt','desc').limit(n))
    }
    else{
      return this.db.colWithIds$('feeds', ref => ref.orderBy('createdAt','desc').startAfter(doc).limit(n))
    }

  }

  getBooks(){
    return this.db.colWithIds$('users/'+this.uid+'/books', ref => ref.orderBy('createdAt','desc'))
  }

  getReports(){
    return this.db.colWithIds$('reports', ref => ref.orderBy('createdAt','desc'))
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

  getEventFeedback(evId,type) {
    return this.db.colWithIds$("events/"+type +'/' +type+'/' +evId +"/feedbacks", ref => ref.orderBy('createdAt','asc'))
  }

  getFeedsComment(evId,type) {
    if(type ==="Suggested Events"){
      return this.db.colWithIds$("events/"+type +'/' +type+'/' +evId +"/feedbacks", ref => ref.orderBy('createdAt','asc'))
    }
    else{
      return this.db.col$("feeds/"+evId +"/comments", ref => ref.orderBy('createdAt','asc'))
    }
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

   getClubMembers(clubId){
     return this.db.colWithIds$('users/'+clubId +'/members')
   }

  getUser(email){
    return this.db.col$("users/",ref => ref.where('email', '==', email))
  }
   
  updateFeedLike(fd){
    let feed ={
      likes:fd.likes
    }
    return  this.db.update("feeds/"+fd.id,feed)
  }

  updateSpiritPoints(header,id,points){
    let myobserver = new Subject()
    let n = 0 // number of times it has changed
    let ev = this.db.doc$("users/"+id).pipe(takeUntil(myobserver))
    ev.subscribe((user:any)=>{
      n+=1
      if(n === 1){
      let myspiritPoints = {
        spiritPoints:user.spiritPoints + points,

      }
      myspiritPoints[header] =this.db.timestamp
        this.db.update("users/"+id, myspiritPoints).then(()=>{
          myobserver.next()
          myobserver.complete()
        })
      }
      
    })
    
    
  }

  updateUserActivity(status) {
    let result:any = ''
    if(this.currentUser!==''){
      let activity  = {
        activity: status
      } 
      result = this.db.update("users/"+this.uid, activity)
    }
    console.log(result)
    return result
  }

  updateChatActivity(status) {
    let activity  = {
      chatactivity: status
    } 
    return this.db.update("users/"+this.uid, activity)
  }

  updateEventGoing(ev,header,uid,youGoing){
    let plannerEvent = { 
      startTime: ev.plannerStartTime, 
      endTime: ev.plannerEndTime, 
      allDay: false, 
      title:ev.title, 
      eventType:'public', 
      eventRef:this.db.doc("events/"+header +'/'+ header +'/'+ ev.id).ref,
      rating:0,
      eventAttended:false
    }
    let event ={
      going:ev.going
    }
    return  this.db.update("events/"+header +'/'+ header +'/'+ ev.id,event).then(()=>{
      if(youGoing){
        this.db.set("users/"+uid+"/event/"+ev.id,plannerEvent)
      }
      else{
        this.db.delete("users/"+uid+"/event/"+ev.id)
      }
    })
  }

  updateEventGone(evId,uid){
    let plannerEvent = { 
      eventAttended: true
    }
    return this.db.update("users/"+uid+"/event/"+evId,plannerEvent)
  }

  checkEventAttended(ev,uid){
    return this.db.doc$("users/"+uid+"/event/"+ev.id)
  }

  addClubMembers(userRef,position,uid){
    let member ={
      member: userRef,
      position: position
    }
    return this.db.upsert('users/'+this.uid+'/members/'+uid , member);
  }

  joinClub(userRef,position,clubId){
    let member ={
      member: userRef,
      position: position
    }
    return this.db.upsert('users/'+clubId+'/members/'+this.uid , member);
  }

  getBlockedUser(){
    return this.db.colWithIds$("blocked", ref => ref.where('blockedBy', '==',this.uid));
  }

  getOtherBlockedUser(){
    return this.db.colWithIds$("blocked", ref => ref.where('blocked', '==',this.uid));
  }

  blockUser(block){
    let blocked ={
      blockedBy: this.uid,
      blocked: block
    }
    return this.db.upsert("blocked/"+block+this.uid,blocked)
  }

  unBlockUser(block){
    return this.db.delete("blocked/"+block+this.uid)
  }

  addBuses (type,data){
    return this.db.add('buses/'+type+'/' +type, data);
  }

  addBus (type,data){ // dorms amd athletics bus schedule
    return this.db.upsert('buses/'+type, data);
  }

  addFeed(feed){
    return  this.db.add("feeds",feed)
  }
  
  addBooks(book){
    return  this.db.add('users/'+this.uid+'/books',book)
  }

  addComment(comment, evId,evType, header){
    let type;
    let destination;
    let feedback ={
      comment: comment,
      userRef: this.userRef
    }
    if(header=="Feedbacks"){
      type = "events/" +evType + '/' +evType +'/'
      destination ="/feedbacks"
    }
    else{
      if(evType ==="Suggested Events"){
        type = "events/" +evType + '/' +evType +'/'
        destination ="/feedbacks"
      }
      else{
        type = "feeds/"
        destination ="/comments"
      }
      
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
          if(evType ==="Suggested Events"){
            event ={
              feedback: x.length
            }
          }
          else{
            event ={
              comment: x.length
            }
          }
        }
        this.db.update(type+evId,event)
      })
    
    })
  }

  addJob(job){
    return  this.db.add("jobs",job)
  }

  addReport(report){
    return  this.db.add("reports",report)
  }

  getRef(value:any) {
    return this.db.doc$(value.path)
  }

  addEvent(header,event,date,start,end){
    let eventDate=  moment(date).format('MM/DD/YYYY');
    event['postedBy'] = this.db.doc('users/'+this.uid).ref;
    event['eventDate'] =  moment(date).format('MMMM DD YYYY');
    event['startTime'] = moment( date +' '+ start).format('hh:mm A')
    event['plannerStartTime'] = moment(eventDate + ' ' + start).format('LLLL')
    event['plannerEndTime'] = moment(eventDate + ' ' + end).format('LLLL')
    event['endTime'] = moment(date +' '+ end).format('hh:mm A')
  
    return  this.db.add("events/"+header+'/'+header,event)
  }

  saveMyEvents(event){
    return  this.db.add("users/"+this.uid+"/event",event)

  }

  

  addGroup(header,groupName,description,profilePic,type?,location?,deal?){
    switch (header) {
      case "RIT Athletics":
      let athletics={
        about: description,
      }
      return this.db.set("RIT Athletics/"+groupName,athletics).then(()=>{
        let email = groupName.trim().replace(/\s+/g, "").toLowerCase() +'@rit.edu';
        var   account = {
          fullName: groupName ,
          email: email,
          admin: "athletics",
          type: 'club'
        };
        account['clubType'] = "Private";
        account['description'] =  description;
        account["staff"] = false;
        account["spiritPoints"]= -1;
        account['photoUrl'] = profilePic;
        account['emailVerified'] = false;
        let password = groupName.trim().replace(/\s+/g, "").toLowerCase() +'1234';
        return this.signOut().then(()=>{
          return this.signUpUserService(account,password)
        }) 
      });
      case "RIT Clubs":
      let club={
        type:type
      }
      return this.db.set("clubs/"+groupName,club).then(()=>{
        let email = groupName.trim().replace(/\s+/g, "").toLowerCase() +'@rit.edu';
        var   account = {
          fullName: groupName ,
          email: email,
          admin: "clubs",
          type: 'club'
        };
        account['clubType'] = type;
        account['description'] =  description;
        account["staff"] = false;
        account["spiritPoints"]= -1;
        account['photoUrl'] = profilePic;
        account['emailVerified'] = false;
        let password = groupName.trim().replace(/\s+/g, "").toLowerCase() +'1234';
        return this.signOut().then(()=>{
          return this.signUpUserService(account,password)
        }) 
      });
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
