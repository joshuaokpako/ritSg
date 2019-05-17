import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Events } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FirestoreProvider } from '../../providers/firestore/firestore';
import { Observable } from 'rxjs';

/**
 * Generated class for the VerifyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-verify',
  templateUrl: 'verify.html',
})
export class VerifyPage implements OnInit{
user:Observable<any>;
password;
myUser;
userSubs;

  constructor(public events:Events, public uS : UserserviceProvider, public fs:FirestoreProvider, public loadingCtrl:LoadingController, public alertCtrl:AlertController, public navCtrl: NavController, public navParams: NavParams) {
  
  }

  ngOnInit(){

    
  }

  ionViewWillLoad() {
    this.userSubs=this.uS.fireAuth.authState.subscribe(user => {
      if (user) {
        this.user = this.uS.db.doc$('users/'+user.uid);
      }
    })
    console.log(this.user)
    
  }

  goBack(){
    this.uS.signOut().then(()=>{
      this.navCtrl.setRoot('CoverPage');
    }).catch((error) => {
      this.navCtrl.setRoot('CoverPage')
    });
  }

  reset(){
    
    var loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    loader.present();
    let cUser = this.uS.fireAuth.auth.currentUser;
    cUser.updatePassword(this.password).then(() => {
      this.uS.updateClubEmailVerified(cUser.uid).then(()=>{
        loader.dismiss()
        this.navCtrl.setRoot('TabsPage')
      })
    }).catch((error) => {
      loader.dismiss()
      let alert = this.alertCtrl.create({
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
    });
  }

  ngOnDestroy(){
    if (this.userSubs){
      this.userSubs.unsubscribe();
    }
  }

}


