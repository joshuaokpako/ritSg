import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController } from 'ionic-angular';
import { AddEventPage } from '../add-event/add-event';
import { map, flatMap, filter } from 'rxjs/operators';
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
export class EventsPage implements OnInit {
  public eventHeaderName:string;
  tabBarElement:any;
  public sgEvents:any;
  public ritEvents;
  public comHEvents;
  public otherEvents;
  public sugEvents;
  public loading:any;
  public user;
  subscription;

  constructor(public modalCtrl: ModalController,public loadingCtrl: LoadingController,public navCtrl: NavController, 
    public navParams: NavParams,public uS: UserserviceProvider) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.eventHeaderName = "SG Events";
    this.user= "";
      
  }
  
  ngOnInit(){
    this.subscription = this.uS.user.pipe(map((user:any)=>{
     if (user.groupAdmin){
        user.groupAdmin.forEach(element => {
          switch (element) {
            case "SG":
              user.SG=true
              break;
            default:
              console.log("didn't work")
              break;
            }
        });
        
      }
      return user    
    })).subscribe(x=>this.user=x )

    this.showEvents("SG Events");
  }

  ngOnDestroy() { 
   if (this.subscription) {
      this.subscription.unsubscribe();
    }
  
  }

  presentLoader(toggle){
    
    if (toggle ==true){
      this.loading = this.loadingCtrl.create({
        content: 'Loading...',
        showBackdrop: false
      });
      this.loading.present()
    }
    else{
      this.loading.dismiss();
    }

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
        this.sgEvents = this.uS.sgEvents.pipe(map((event:any)=>{
          return event.sort(function(a, b){return b.postTime.seconds - a.postTime.seconds})
        }))
        break;
      case "RIT Events":
        this.ritEvents = this.uS.ritEvents.pipe(map((event:any)=>{
          return event.sort(function(a, b){return b.postTime.seconds - a.postTime.seconds})
        }))
        break;
      case "Common Hour Events":
        this.comHEvents = this.uS.comHEvents.pipe(map((event:any)=>{
          return event.sort(function(a, b){return b.postTime.seconds - a.postTime.seconds})
        }))
        break;
      case "Other Events":
        this.otherEvents = this.uS.otherEvents.pipe(map((event:any)=>{
          return event.sort(function(a, b){return b.postTime.seconds - a.postTime.seconds})
        }))
        break;
      case "Suggested Events":
        this.sugEvents = this.uS.sugEvents.pipe(map((event:any)=>{
          return event.sort(function(a, b){return b.postTime.seconds - a.postTime.seconds})
        }))
        break;
    
      default:
        break;
    }
    this.eventHeaderName = name;
  }
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddEventPage,addObj)
    modal.present()
  }
}
