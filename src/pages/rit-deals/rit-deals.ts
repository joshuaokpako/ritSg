import { Component, OnInit } from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { map} from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the RitDealsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-rit-deals',
  templateUrl: 'rit-deals.html',
  providers: [UserserviceProvider]
})
export class RitDealsPage implements OnInit {
  public deals:any;
  subscription:any;
  public user;

  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController) {
    this.user="";
    this.deals = this.uS.deals;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RitDealsPage');
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
  toDetails(headerName,photo,about, deal , location, headerType){
    console.log(location)
    let dealsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      deal : deal,
      type: headerType,
      location: location
    }
    this.navCtrl.push('DetailsPage',dealsObj)
  }
  addGroupModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddpagePage',addObj)
    modal.present()
  }
}
