import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Geofence } from '@ionic-native/geofence';

/**
 * Generated class for the TransportationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-transportation',
  templateUrl: 'transportation.html',
})
export class TransportationPage {
 type = "RIT Bus"
  constructor(public geofence: Geofence, public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TransportationPage');
  }

}
