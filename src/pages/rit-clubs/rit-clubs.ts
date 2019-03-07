import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController,AlertController } from 'ionic-angular';
import { map } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
/**
 * Generated class for the RitClubsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rit-clubs',
  templateUrl: 'rit-clubs.html',
  providers: [UserserviceProvider]
})
export class RitClubsPage implements OnInit {
  subscription;
  public user:any;
  public clubs:any;

  constructor(public alertCtrl:AlertController, public uS : UserserviceProvider,public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController) {
    this.user= "";
    this.clubs = this.uS.clubs.pipe(map(club=>{
      return club.sort()
    })
    )
  }

  ionViewDidLoad() {
    
  }

  ngOnInit(){
    this.subscription = this.uS.user.pipe(map((user:any)=>{
      return user     
    })).subscribe(x=>this.user=x )


  }

  ngOnDestroy() { 
   if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  toDetails(headerName,photo,about,pageType,id,club){
    let clubsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      type: pageType,
      id: id,
      obj:club
    }
    this.navCtrl.push('DetailsPage',clubsObj)
  }

  addGroupModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddpagePage',addObj)
    modal.present()
    modal.onDidDismiss(data=>{
      let alert = this.alertCtrl.create({
        subTitle: 'Club email is: ' +data.email.trim().replace(/\s+/g, "").toLowerCase() + ' and password is ' +data.password,
        buttons: ['OK']
        });
      alert.present();
    })
  }
}

