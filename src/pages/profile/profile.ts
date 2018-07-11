import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, App } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { CoverPage } from '../cover/cover';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [UserserviceProvider]
})
export class ProfilePage implements OnInit {
  public userName:string;

  constructor(public usersService : UserserviceProvider, public navCtrl: NavController, public navParams: NavParams, public app:App) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  ngOnInit(){
    this.userName = this.usersService.userName;
   
  }

  signOut(){
    this.usersService.signOut().then(()=>{
      console.log("yes it did")
      this.app.getRootNav().setRoot(CoverPage)
    }).catch((error) => {
      // An error happened.
    });
  }

}
