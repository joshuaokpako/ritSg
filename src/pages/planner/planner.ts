import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController, IonicPage } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import * as moment from 'moment';
import { map } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-planner',
  templateUrl: 'planner.html'
})
export class PlannerPage implements OnInit{
  eventSource = [];
  viewTitle: string;
  selectedDay = new Date();
 
  calendar = {
    mode: 'month',
    currentDate: new Date()
  };
  
  constructor(public uS:UserserviceProvider, public navCtrl: NavController, private modalCtrl: ModalController, private alertCtrl: AlertController) { 
    
    
  }
 
  ngOnInit(){
    this.uS.getMyEvents()
    .pipe(
      map((ev:any)=>{
        ev.forEach(e => {
          e.startTime =  new Date(e.startTime);
          e.endTime = new Date(e.endTime);
        }); 
       
        return ev
      })
    ).subscribe((ev:any)=>{
     
      this.eventSource = ev;
    })
  }

  addEvent() {
    let modal = this.modalCtrl.create('PlannerModalPage', {selectedDay: this.selectedDay});
    modal.present();
   
  }
 
  onViewTitleChanged(title) {
    this.viewTitle = title;
  }
 
  onEventSelected(event) {
    let start = moment(event.startTime).format('LLLL');
    let end = moment(event.endTime).format('LLLL');
    
    let alert = this.alertCtrl.create({
      title: '' + event.title,
      subTitle: 'From: ' + start + '<br>To: ' + end,
      buttons: ['OK']
    })
    alert.present();
  }
 
  onTimeSelected(ev) {
    this.selectedDay = ev.selectedTime;
  }
 

}
