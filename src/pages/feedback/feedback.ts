import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage implements OnInit {
tabBarElement:any;
public header:string;
public evId:string;
public feedback:any;
public userId:any;
public comment:string ='';
  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.header = this.navParams.get('header');
    this.evId = this.navParams.get('eventId');
  }

  ngOnInit(){
   this.feedback = this.uS.getEventFeedback(this.evId)
   this.userId = this.uS.uid
  }

  addComment(){
    if (this.comment!=''){
      this.uS.addComment(this.comment,this.evId).then(()=>{
        this.comment="";
      })
    }
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FeedbackPage');
  }

}
