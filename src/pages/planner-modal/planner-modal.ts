import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import * as moment from 'moment';
 
@Component({
  selector: 'page-planner-modal',
  templateUrl: 'planner-modal.html',
})
export class PlannerModalPage {

 
  event = { startTime: new Date().toISOString(), endTime: new Date().toISOString(), allDay: false, title:"", eventType : "private" };
  minDate = new Date().toISOString();
 
  constructor(public uS:UserserviceProvider, public navCtrl: NavController, private navParams: NavParams, public viewCtrl: ViewController,private alertCtrl: AlertController) {
    let preselectedDate = moment(this.navParams.get('selectedDay'))
    this.event.startTime = preselectedDate.format();
    this.event.endTime = preselectedDate.add(1, 'hours').format();
     
  }
 
  cancel() {
    this.viewCtrl.dismiss();
  }
 
  save() {
    if(moment(this.event.endTime).isSameOrBefore(this.event.startTime)){
      let alert = this.alertCtrl.create({
        title: 'Change End Date',
        subTitle:'Start time is greater than or same as end time',
        buttons: ['OK']
      })
      alert.present();

    }
    else{
      this.uS.saveMyEvents(this.event).then(()=>this.viewCtrl.dismiss())
    }
    
  }
 
}