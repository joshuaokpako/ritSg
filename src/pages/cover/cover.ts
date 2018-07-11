import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { TabsPage } from '../tabs/tabs';
import { LoginPage } from '../login/login';
import { RegisterPage } from '../register/register';

/**
 * Generated class for the CoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cover',
  templateUrl: 'cover.html',
  providers: [UserserviceProvider]
})
export class CoverPage implements OnInit {

  constructor(public usersService : UserserviceProvider,public navCtrl: NavController, public navParams: NavParams) {
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
  ionViewDidLoad() {
    console.log('ionViewDidLoad CoverPage');
  }
  redirectToLogin(){
    this.navCtrl.push(LoginPage);
  }

  redirectToSignup(){
    this.navCtrl.push(RegisterPage);
  }
  setRootPage(){
    this.navCtrl.setRoot(TabsPage);
  }
}
