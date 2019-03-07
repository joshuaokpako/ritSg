import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the ViewMembersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-view-members',
  templateUrl: 'view-members.html',
})
export class ViewMembersPage {
  id;
  members;
  header ='';

  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.id = this.navParams.get('clubId')
    this.header = this.navParams.get('header')
  }

  ionViewDidLoad() {
    this.members = this.uS.getClubMembers(this.id);
  }

}
