import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';



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

  constructor(public uS: UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
   
    
  }

  ionViewWillEnter(){
    this.uS.fireAuth.authState.subscribe(user => {
      if (user) {
        this.navCtrl.setRoot('TabsPage');
      }
    })
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
