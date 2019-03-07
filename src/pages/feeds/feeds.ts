import { Component, OnInit } from '@angular/core';
import { NavController,ModalController, IonicPage, AlertController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, share } from 'rxjs/operators';

@IonicPage()
@Component({
  selector: 'page-feeds',
  templateUrl: 'feeds.html'
})
export class FeedsPage implements OnInit {
  eventHeaderName:string ="Feeds";
  test:boolean;
  public feeds:any;
  user;
  theUser; // to show 

  constructor(private alertCtrl: AlertController,public uS:UserserviceProvider, public navCtrl: NavController,public modalCtrl: ModalController) {

  }

  ionViewWillEnter(){
    this.test = false
  }

  ngOnInit(){
    this.user =this.uS.db.doc$('users/'+this.uS.uid)
    this.user.subscribe(x => this.theUser = x)
    let output:any =""
    this.test = false;
    this.feeds = this.uS.getFeed().pipe(map((feed:any)=>{
        if(this.test == false){ // to make sure the postedBy only loads on page enter
        feed.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x;
              this.test =true;
              output = feed;
            })
          if(myelement.likes){
            myelement.likes.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youLike = true;
            } 
            });
          }
        });
      }
      else {
        for (let i = 0; i < feed.length; i++) {
          let newFeedLength =feed.length - output.length
          if(i < newFeedLength){ // only get the postedBy for new posts
            this.uS.getRef(feed[i].postedBy)
            .subscribe(x=>{
              feed[i].postedBy =x;
            })
          }
          else if (newFeedLength < 0){
            this.ngOnInit();
          }
          else{
            feed[i].postedBy = output[i-newFeedLength].postedBy // use old postedBy for old posts until page reenter
          }    
        }
        feed.forEach(myelement => {
          if(myelement.likes){
            myelement.likes.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youLike = true;
            }
            });
          }
        });
      }
      output = feed;
      return feed
    }),share()
  ) 
  }

  doRefresh(refresher){
    this.ngOnInit()
    if(this.feeds){
      refresher.complete();
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
      type:'feed',
      likes: likes
    }
    this.navCtrl.push('FeedbackPage',obj)
  }

  delete(feedId){
    this.uS.db.delete('feeds/'+feedId).then(()=>{
      this.ngOnInit()
    }).catch(error=>{
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: error
      })
      alert.present()
    })
  }

  addFeedModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddFeedPage', addObj)
    modal.present()
  }

  trackId(index, feed) {
    return feed ? feed.id : undefined;

  }
}
