import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the DetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage {
  public header:string;
  public img:string;
  public about:string;
  public type:string;
  public deal:string;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.header= this.navParams.get('header');
    this.img = this.navParams.get('pic');
    this.about = this.navParams.get('about');
    this.type = this.navParams.get('type');
    this.deal = this.navParams.get('deal')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DetailsPage');
  }

}
