import { HttpClient } from '@angular/common/http';
import { Injectable} from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection} from 'angularfire2/firestore';
import { Observable } from 'rxjs';

export interface User{
  fullName:string;
  email:string;
  profilePic:string;
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
 
  usersCollection: AngularFirestoreCollection<User>;
  item: Observable<User[]>;

  constructor(public http: HttpClient,private firebaseauth:AngularFireAuth,private afs: AngularFirestore) {
  this.fireAuth = this.firebaseauth;
  this.fireAuth.authState.subscribe(user => {
    if (user) {
      this.userName = user.displayName;
      this.userEmail = user.email;
      this.userPhotoUrl = user.photoURL;

      
    } 
    else {
      
    }
  
  })
  
  this.usersCollection = this.afs.collection<User>("users");

 
  
  }


  loginUserService(email: string, password: string): any {
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password);
  }


  signUpUserService(account: User, password){

    
        return this.fireAuth.auth.createUserWithEmailAndPassword(account['email'], password).then((newUser) => {
          //sign in the user
          this.fireAuth.auth.signInWithEmailAndPassword(account['email'], password).then((updateProfile) =>{
          var cUser = this.fireAuth.auth.currentUser;
            cUser.updateProfile({
              displayName: account['fullName']
            }).then(function() {
              this.userName = account['fullName'];
              // Update successful.
            }).catch(function(error) {
              // An error happened.
            });
          }
          )
        });

  }
 
  signOut(){
    return this.fireAuth.auth.signOut();
  }
 



}
