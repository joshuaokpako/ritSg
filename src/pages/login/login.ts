import { Component, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { TabsPage } from '../tabs/tabs';
import { FormsModule }   from '@angular/forms';

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


  constructor(public usersService : UserserviceProvider,public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,  public navCtrl: NavController, public navParams: NavParams) {
      var that =this
    
    this.usersService.fireAuth.authState.subscribe(user => {
      if (user) {
        that.navCtrl.setRoot(TabsPage);
        console.log("worked");
      } 
      else {
        console.log("failed");
      }
    })
  }
  ngOnInit(){

  }

  

  submitLogin(){
    let ritemailend = this.email.trim().replace(/\s+/g, " ").slice(-8);//get the last 8 char of email

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
        loader.dismiss();
        that.navCtrl.setRoot(TabsPage);
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
  forgotPassword(){

  }
}
