import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DetailsPage } from '../details/details';
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
export class RitAthleticsPage {
  public athletics:any;
  public tabBarElement:any;

  constructor(public uS:UserserviceProvider,public navCtrl: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.athletics = this.uS.athletics
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RitAthleticsPage');
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  toDetails(headerName,photo,about,pageType){
    let clubsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      type: pageType
    }
    this.navCtrl.push(DetailsPage,clubsObj)
  }
}
