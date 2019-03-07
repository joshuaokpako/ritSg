import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, IonicPage } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map } from 'rxjs/operators';
/**
 * Generated class for the FeedbackPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-feedback',
  templateUrl: 'feedback.html',
})
export class FeedbackPage implements OnInit {
@ViewChild(Content) content: Content;
tabBarElement:any;
myLikes;
feedHeaderType ;
public header:string;
public type:string;
public evId:string;
public feedback:any;
public userId:any;
public comment:string ='';
  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.header = this.navParams.get('header');
    this.evId = this.navParams.get('eventId');
    this.type = this.navParams.get('type');
    this.myLikes = this.navParams.get('likes').reverse();
  }

  ngOnInit(){
    this.userId = this.uS.uid

    if(this.header=="Feedbacks"){
      this.feedHeaderType = 'feedback';
      let test =false
      let output:any =""
      this.feedback = this.uS.getEventFeedback(this.evId, this.type).pipe(
        map((feed:any)=>{
          if (test==false) {
            feed.forEach(myelement => {
              this.uS.getRef(myelement.userRef).subscribe(x=>{
                myelement.userRef =x;
                test =true;
                output =feed;
              })
            })
          }
          else {
            let  newFeed = feed.slice(output.length)
            for (let i = 0; i < newFeed.length; i++) {
              this.uS.getRef(newFeed[i].userRef)
              .subscribe(x=>{
                newFeed[i].userRef =x;
              })      
            }
            feed =output.concat(newFeed)
            output = feed;
          }
          return feed
        })
      )
    }
    else{
      this.feedHeaderType = 'comments'
      let test =false
      let output:any =""
      this.feedback = this.uS.getFeedsComment(this.evId,this.type).pipe(
        map((feed:any)=>{
          if (test==false) {
            feed.forEach(myelement => {
              this.uS.getRef(myelement.userRef).subscribe(x=>{
                myelement.userRef =x;
                test =true;
                output =feed;
            })
          })
        }
        else{
          let  newFeed = feed.slice(output.length)
          for (let i = 0; i < newFeed.length; i++) {
            this.uS.getRef(newFeed[i].userRef).subscribe(x=>{
              newFeed[i].userRef =x;
            })      
          }
          feed =output.concat(newFeed)
          output = feed;
        }
        return feed
        })
      )
    }
  }

  addComment(){
    if (this.comment!=''){
      let theComment =this.comment
      this.comment="";
      this.uS.addComment(theComment,this.evId,this.type,this.header)
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

  trackId(index, feed) {
    console.log(feed);
    return feed ? feed.id : undefined;

}

}
