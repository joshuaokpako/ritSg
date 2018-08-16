import { Component, OnInit } from '@angular/core';
import { NavController,ModalController } from 'ionic-angular';
import { AddFeedPage } from '../add-feed/add-feed';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map } from 'rxjs/operators';
import { FeedbackPage } from '../feedback/feedback';

@Component({
  selector: 'page-feeds',
  templateUrl: 'feeds.html'
})
export class FeedsPage implements OnInit {
  eventHeaderName:string ="Feeds";
  public feeds:any;

  constructor(public uS:UserserviceProvider, public navCtrl: NavController,public modalCtrl: ModalController) {

  }

  ngOnInit(){
    this.feeds = this.uS.getFeed().pipe(map((feed:any)=>{
      feed.forEach(myelement => {
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
    return feed
    })) 
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

  addFeedModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddFeedPage, addObj)
    modal.present()
  }

}
