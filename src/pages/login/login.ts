import { Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, App, Events } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FirestoreProvider }   from '../../providers/firestore/firestore';
import { FcmProvider } from '../../providers/fcm/fcm';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  providers: [UserserviceProvider]
})
export class LoginPage implements OnInit {
  public email: string;
  public password: string;
  public checkUser: void;


  constructor(public fs: FirestoreProvider,public fcm:FcmProvider, public usersService : UserserviceProvider,public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,  public navCtrl: NavController, public events: Events, public navParams: NavParams, public app:App) {
      var that =this
    
  }
  ngOnInit(){
    
  }

  

  submitLogin(){
    this.email = this.email.trim().replace(/\s+/g, "")
    let ritemailend = this.email.trim().replace(/\s+/g, "").slice(-8);//get the last 8 char of email

    //check if its an rit email ending with @rit.edu
    if(ritemailend!="@rit.edu"){
      let alert = this.alertCtrl.create({
        subTitle: 'email must be an rit email ending with @rit.edu',
        buttons: ['OK']
      });
      alert.present();
      this.password = ""//empty the password field
    }

    else{
      var that = this;
      var loader = this.loadingCtrl.create({
        content: "Please wait..."
      });
      loader.present();
      this.usersService.loginUserService(this.email.trim().replace(/\s+/g, " "), this.password).then(authData => {
        //successful
        this.fcm.getToken()
        this.events.publish('loggedIn', 'logged in')
          loader.dismiss();
          this.app.getRootNav().setRoot('TabsPage')
        
      },
      error => {
        loader.dismiss();
        // Unable to log in
        let alert = this.alertCtrl.create({
          subTitle: error,
          buttons: ['OK']
        });
        alert.present();
        that.password = ""//empty the password field
      })
    }
  }

  loginGuest(){
    var loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.usersService.loginAnonymously().then(authData => {
      //successful
      loader.dismiss();
      this.app.getRootNav().setRoot('TabsPage')
      
    },
    error => {
      loader.dismiss();
      // Unable to log in
      let alert = this.alertCtrl.create({
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
    }).catch(error=>{
      let alert = this.alertCtrl.create({
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
    })
  }
  forgotPassword(){
    if(!this.email){
      let alert = this.alertCtrl.create({
        subTitle: 'Fill in your RIT email first',
        buttons: ['OK']
      });
      alert.present();
    }
    else{
      this.email = this.email.trim().replace(/\s+/g, "")
      this.fs.firebase.auth().sendPasswordResetEmail(this.email).then((success) =>{
        let alert = this.alertCtrl.create({
          subTitle: 'Sent Reset Email',
          buttons: ['OK']
        });
        alert.present();
      }).catch((error) => {
        let alert = this.alertCtrl.create({
          subTitle: error,
          buttons: ['OK']
        });
        alert.present();
      });
    }
    
  }
}
