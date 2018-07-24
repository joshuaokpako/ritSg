import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController } from 'ionic-angular';
import { AddEventPage } from '../add-event/add-event';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the EventsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
  providers: [UserserviceProvider]
})
export class EventsPage {
  public eventHeaderName:string;
  tabBarElement:any;
  public sgEvents:any;
  public loading:any;

  constructor(public modalCtrl: ModalController,public loadingCtrl: LoadingController,public navCtrl: NavController, 
    public navParams: NavParams,public uS: UserserviceProvider) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.eventHeaderName = "SG Events";
    this.loading = this.loadingCtrl.create({
      content: 'Loading...',
      showBackdrop: false
    });
    this.loading.present()
    this.showEvents("SG Events");
    
  }
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsPage');
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  showEvents(name){
    switch (name) {
      case "SG Events":
        this.sgEvents = this.uS.sgEvents;
        this.loading.dismiss()
        break;
    
      default:
        this.loading.dismiss()
        break;
    }
    this.eventHeaderName = name;
  }
  addEventModal(header){
    console.log(header)
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddEventPage,addObj)
    modal.present()
  }
}
