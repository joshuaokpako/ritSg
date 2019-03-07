import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { NavController, ToastController, IonicPage, Events } from 'ionic-angular';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
toast;
anonymous = false;
  constructor(public events:Events, public uS:UserserviceProvider,public toastCtrl:ToastController, private spinnerDialog: SpinnerDialog,public navCtrl: NavController,private iab: InAppBrowser) {
  }

  ngOnInit(){
    this.uS.fireAuth.authState.subscribe(user => {
      if (user) {
        this.anonymous = user.isAnonymous;
      }
    })
     
  }

  openBrowser(link){
    const browser = this.iab.create(link,'_blank', 'location=yes,hideurlbar=yes,hidespinner=yes,toolbarcolor=#F36E21');
    browser.on('loadstart').subscribe(event => {
      this.spinnerDialog.show();
   });
    browser.on('loadstop').subscribe(event => {
    this.spinnerDialog.hide();
    });
    browser.on('loaderror').subscribe(event => {
      this.spinnerDialog.hide();
    });
    
    browser.show()
  }
  
  toEvents(){
    this.navCtrl.push('EventsPage')
  }

  toClubs(){
    this.navCtrl.push('RitClubsPage')
  }

  toDeals(){
    this.navCtrl.push('RitDealsPage')
  }

  toAthletics(){
    this.navCtrl.push('RitAthleticsPage')
  }
  toFaculty(){
    this.navCtrl.push('FacultyPage')
  }
  toTransportation(){
    this.navCtrl.push('TransportationPage')
  }
  toJobs(){
    this.navCtrl.push('JobsPage')
  }
  logout(){
    this.uS.signOut().then(()=>{
      this.navCtrl.setRoot('CoverPage')
    }).catch((error) => {
      this.navCtrl.setRoot('CoverPage')
    });
  }
}
