import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NavController } from 'ionic-angular';
import { EventsPage } from '../events/events';
import { RitClubsPage } from '../rit-clubs/rit-clubs';
import { RitDealsPage } from '../rit-deals/rit-deals';
import { RitAthleticsPage } from '../rit-athletics/rit-athletics';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private iab: InAppBrowser) {

  }
  openBrowser(link){
    console.log("working")
    const browser = this.iab.create(link);
    browser.show()
  }
  
  toEvents(){
    this.navCtrl.push(EventsPage)
  }

  toClubs(){
    this.navCtrl.push(RitClubsPage)
  }

  toDeals(){
    this.navCtrl.push(RitDealsPage)
  }

  toAthletics(){
    this.navCtrl.push(RitAthleticsPage)
  }
}
