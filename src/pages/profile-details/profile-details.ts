import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, takeUntil } from "rxjs/operators"
import { FeedbackPage } from '../feedback/feedback';
import { Subject } from 'rxjs';

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
  public userSpirit;
  public members;
  public reports;
  resHeight;

  constructor(public loadingCtrl:LoadingController, public uS:UserserviceProvider,
     public alertCtrl:AlertController, public navCtrl: NavController, 
     public navParams: NavParams, public platform: Platform) {
    this.header = this.navParams.get('header')
  }

  ngOnInit(){
    this.resHeight = this.platform.height() *0.7
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
    if (this.header =="Spirit Points"){
      this.userSpirit = this.uS.getUsersSpirit()
    }
    if (this.header == "Members") {
      this.members = this.uS.getClubMembers(this.uS.uid)
    }
    if (this.header == "Reports") {
      this.reports = this.uS.getReports()
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

toComments(header,id,likes){
  let obj ={
    header:header,
    eventId: id,
    likes: likes
  }
  this.navCtrl.push(FeedbackPage,obj)
}

toFeedback(header,id,going){
  console.log(going)
  let obj ={
    header:header,
    eventId: id,
    likes: going
  }
  this.navCtrl.push(FeedbackPage,obj)
}

showAlert(){
  let alert = this.alertCtrl.create({
    title: 'New Member Email',
    message: "Add member to group",
    inputs: [
      {
        name: 'userEmail',
        placeholder: 'member email '
      },
      {
        name: 'userPosition',
        placeholder: 'member position e.g President '
      }
    ],
    buttons: [
        {
        text: 'Add Members',
        handler: (data) => {
          this.addMember(data.userEmail, data.userPosition) 
        }
      },
      'No',
    ]
  })
  alert.present()
}

addMember(email,position){
  var loader = this.loadingCtrl.create({
    content: "Please wait..."
  });
  loader.present();
  let observer = new Subject();
  let userEmail = email.trim().replace(/\s+/g, "").toLowerCase()
  this.uS.getUser(userEmail).pipe(takeUntil(observer)).subscribe((user:any)=>{
    if (user.length != 0){
      let userRef = this.uS.getUserRef(user[0].uid)
        this.uS.addClubMembers(userRef,position,user[0].uid).then(x=>{ // adding to going
          loader.dismiss();
          observer.next()
          observer.complete()
        }).catch((error)=>{
          loader.dismiss();
          let alert = this.alertCtrl.create({
            title: error,
            subTitle: 'There was an error',
            buttons: ['OK']
          })
          alert.present()
          observer.next()
          observer.complete()
        })
      }
    })
}

deleteMember(member){
  let alert = this.alertCtrl.create({
    title: 'Delete Member',
    message: "Are you sure you want to delete this member?",
    buttons: [
        {
        text: 'Yes',
        handler: () => {
          this.delete(member) 
        }
      }
    ]
  })
  alert.present()
}

delete(mem){
  this.uS.db.delete('users/'+this.uS.uid + '/members/'+mem.id)
}
ionViewDidLoad() {
  console.log('ionViewDidLoad ProfileDetailsPage');
}

}
