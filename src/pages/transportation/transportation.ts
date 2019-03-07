import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';

/**
 * Generated class for the TransportationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-transportation',
  templateUrl: 'transportation.html',
})
export class TransportationPage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
  }

  toBus(header){  
    let obj ={
      header:header
    }
    this.navCtrl.push('BusSchedulesPage', obj)
  }

}
