import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

import { TabsPage } from '../tabs/tabs';


/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */



@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [UserserviceProvider]
})
export class RegisterPage {
  public email: string;
  public password: string;
  public name:string;
  public type:any;
  public staff:string;
  public departments:any;
  public faculty:any = "";
  public position:any = "";


  constructor(public usersService : UserserviceProvider,public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,  public navCtrl: NavController, public navParams: NavParams) {
      this.type ="student"
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
    this.getDepartment()
  }

  getDepartment(){
    this.departments = this.usersService.getDepartments()
  }

  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }

  submitLogin(){
    var   account = {
      fullName: this.name,
      email: this.email.trim().replace(/\s+/g, " "),
      admin: "none",
      type: this.type
    };
    if(this.type=="staff"){
      account["staff"] = true;
      account["faculty"] = this.faculty;
      account["position"] = this.position;
    }
    else{
      account["staff"] = false;
    }
    
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
      this.usersService.signUpUserService(account,this.password).then(authData => {
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

}

