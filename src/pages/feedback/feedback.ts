import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map } from 'rxjs/operators';
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
@ViewChild(Content) content: Content;
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
    this.userId = this.uS.uid
    let test =false
    let output:any =""
    if(this.header=="Feedbacks"){
      this.feedback = this.uS.getEventFeedback(this.evId).pipe(map((feed:any)=>{
        feed.forEach(myelement => {
          if (test==false) {
              this.uS.getRef(myelement.userRef).subscribe(x=>{
                myelement.userRef =x;
                test =true;
                output =x;
            })
          }
          else{
            myelement.userRef = output
          }
        })
        return feed
        })
      )
    }
    else{
      this.feedback = this.uS.getFeedsComment(this.evId).pipe(map((feed:any)=>{
        feed.forEach(myelement => {
          if (test==false) {
              this.uS.getRef(myelement.userRef).subscribe(x=>{
                myelement.userRef =x;
                test =true;
                output =x;
            })
          }
          else{
            myelement.userRef = output
          }
        })
        return feed
        })
      )
    }
  }

  addComment(){
    if (this.comment!=''){
      let theComment =this.comment
      this.comment="";
      this.uS.addComment(theComment,this.evId,this.header)
    }
  }

  toBottom(){
    this.content.scrollToBottom(0)
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
