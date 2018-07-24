import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs';

export interface User{
  fullName:string;
  email:string;
  admin:string;
}

var MyUserState:any = function (theuser) {
  if (theuser) {
    return true;
  } 
  else {
    return false
  }
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
  public db:any;
  public sgEvents;
  public ritEvents;
 
  private usersCollection: AngularFirestoreCollection<User>;
  private eventsCollection: AngularFirestoreCollection<any>;
  private clubsCollection: AngularFirestoreCollection<any>;
  private dealsCollection: AngularFirestoreCollection<any>;
  private athleticsCollection: AngularFirestoreCollection<any>;
  events: Observable<any>;
  clubs: Observable<any>;
  deals: Observable<any>;
  athletics: Observable<any>;

  constructor(public http: HttpClient,private firebaseauth:AngularFireAuth,private afs: AngularFirestore) {
    this.fireAuth = this.firebaseauth;
    //get user data
    this.usersCollection = this.afs.collection<User>("users");
    // get clubs data
    this.clubsCollection = this.afs.collection<any>("clubs");
    this.clubs = this.clubsCollection.valueChanges();
    // get deals data
    this.dealsCollection = this.afs.collection<any>("RIT Deals");
    this.deals = this.dealsCollection.valueChanges();
    //get athletics data
    this.athleticsCollection = this.afs.collection<any>("RIT Athletics");
    this.athletics = this.athleticsCollection.valueChanges();
    //get events data
    this.eventsCollection = this.afs.collection<any>("events");
    this.events = this.eventsCollection.valueChanges();
    this.sgEvents= this.afs.collection<any>("events", ref => ref.where('type', '==', 'sg')).valueChanges();
    
    this.fireAuth.authState.subscribe(user => {
      if (user) {
        this.userName = user.displayName;
        this.userEmail = user.email;
        this.userPhotoUrl = user.photoURL;
      } 
    })
}

  loginUserService(email: string, password: string): any {
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password);
  }


  signUpUserService(account:User, password){
    
        return this.fireAuth.auth.createUserWithEmailAndPassword(account['email'], password).then((newUser) => {
          //sign in the user
          this.fireAuth.auth.signInWithEmailAndPassword(account['email'], password).then((updateProfile) =>{
            var cUser = this.fireAuth.auth.currentUser;
            cUser.updateProfile({
              displayName: account['fullName']
              }).then((adduser) => {
                this.usersCollection.add(account);
              }).catch(function(error) {
                console.log(error)
              });
          })
        });

  }
 
  signOut(){
    return this.fireAuth.auth.signOut();
  }
 



}
