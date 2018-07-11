import { Component } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NavController } from 'ionic-angular';
import { EventsPage } from '../events/events';

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
}
