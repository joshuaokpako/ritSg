import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams } from 'ionic-angular';
import { DetailsPage } from '../details/details';
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
export class RitDealsPage {
  tabBarElement:any;
  public deals:any;

  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.deals = this.uS.deals;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RitDealsPage');
  }
  
  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }
  toDetails(headerName,photo,about, deal, headerType){
    let dealsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      deal : deal,
      type: headerType
    }
    this.navCtrl.push(DetailsPage,dealsObj)
  }
}
