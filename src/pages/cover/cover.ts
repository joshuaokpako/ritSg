import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';



/**
 * Generated class for the CoverPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cover',
  templateUrl: 'cover.html'
})
export class CoverPage implements OnInit {

  constructor( public navCtrl: NavController, public navParams: NavParams) {
   
    
  }
  
  ngOnInit(){

    
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad CoverPage');
  }
  redirectToLogin(){
    this.navCtrl.push('LoginPage');
  }

  redirectToSignup(){
    this.navCtrl.push('RegisterPage');
  }
  setRootPage(){
    this.navCtrl.setRoot('TabsPage');
  }
}
