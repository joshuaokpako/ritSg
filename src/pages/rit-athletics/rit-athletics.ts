import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController, AlertController } from 'ionic-angular';
import { map} from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the RitAthleticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rit-athletics',
  templateUrl: 'rit-athletics.html',
  providers: [UserserviceProvider]
})
export class RitAthleticsPage implements OnInit {
  public athletics:any;
  public user:any;
  subscription;

  constructor(public uS:UserserviceProvider, public alertCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController) {
    this.user= "";
    this.athletics = this.uS.athletics.pipe(map(ath=>{
      return ath.sort()
    })
    )
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

  ionViewDidLoad() {
   
  }

  

  toDetails(headerName,photo,about,pageType,id,athletic){
    let clubsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      type: pageType,
      id:id,
      obj:athletic
    }
    this.navCtrl.push('DetailsPage',clubsObj)
  }
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddpagePage',addObj)
    modal.present()
    modal.onDidDismiss(data=>{
      let alert = this.alertCtrl.create({
        subTitle: 'Group email is: ' +data.email.trim().replace(/\s+/g, "").toLowerCase() + ' and password is ' +data.password,
        buttons: ['OK']
        });
      alert.present();
    })
  }
}
