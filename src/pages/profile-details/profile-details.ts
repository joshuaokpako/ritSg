import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map } from "rxjs/operators"
import { FeedbackPage } from '../feedback/feedback';

/**
 * Generated class for the ProfileDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile-details',
  templateUrl: 'profile-details.html',
})
export class ProfileDetailsPage implements OnInit {
  header:any;
  public myFeeds;
  public myEvents;

  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams) {
    this.header = this.navParams.get('header')
  }

  ngOnInit(){
    if (this.header =="My Feeds"){
      this.myFeeds = this.uS.getMyFeed().pipe(map((event:any)=>{
        event.forEach(myelement => {
          this.uS.getRef(myelement.postedBy).subscribe(x=>{
            myelement.postedBy =x;
              })       
          if(myelement.likes){
            myelement.likes.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youLike = true;
            } 
            });
          }
      }); 
        return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
      }))
    }

    if (this.header =="My Events"){
     this.myEvents =  this.uS.getPersonalEvents()
    }
  }

  like(feed){
    if(feed.youLike==true){
      feed.likes = feed.likes.filter((likes)=> {return likes.path!=this.uS.userRef.path})
    this.uS.updateFeedLike(feed)
    }
    else{
      feed.likes.push(this.uS.userRef)
      this.uS.updateFeedLike(feed)
    }
}

toComments(header,id){
  let obj ={
    header:header,
    eventId: id
  }
  this.navCtrl.push(FeedbackPage,obj)
}

toFeedback(header,id){
  let obj ={
    header:header,
    eventId: id
  }
  this.navCtrl.push(FeedbackPage,obj)
}

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfileDetailsPage');
  }

}
