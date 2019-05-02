import { Component, OnInit } from '@angular/core';
import { NavController,ModalController, IonicPage, AlertController, ActionSheetController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, share, take, concat} from 'rxjs/operators';

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
  blockedUsers;
  blockedBy;
  lastFeed;

  new;
  complete = false;
  

  constructor(private alertCtrl: AlertController,public uS:UserserviceProvider, public navCtrl: NavController,public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController) {

  }

  ionViewWillEnter(){
    this.test = false
  }

  async ngOnInit(){
    this.user =this.uS.db.doc$('users/'+this.uS.uid)
    this.user.subscribe(x => this.theUser = x)
    
    this.test = false;
    await this.getBlocked()
    this.getFeeds()
  
    
    
  }
  getBlocked(){
    return new Promise(resolve => {
      this.uS.getBlockedUser().subscribe((x)=> {
        this.blockedUsers = x
        resolve(this.blockedUsers)
      })
    this.uS.getOtherBlockedUser().pipe(take(1)).subscribe(x=>{
      this.blockedBy = x;
    })
  })
  }

  doRefresh(refresher){
    this.ngOnInit()
    if(this.feeds){
      refresher.complete();
    }
  }

  showMore(blocked,reportName, reportEmail) {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Block',
          role: 'destructive',
          handler: () => {
            this.presentConfirm(blocked)
          }
        },{
          text: 'Report',
          role: 'destructive',
          handler: () => {
            let people = {
              reportName: reportName,
              reportEmail: reportEmail,
              reportId: blocked
              
            }
            if(blocked ===this.uS.uid){
              let alert = this.alertCtrl.create({
                title: 'Error',
                message: "You can't report yourself",
                buttons: [
                  {
                    text: 'Ok',
                    role: 'cancel',
                    handler: () => {
                    }
                  }
                ]
              });
              alert.present();
            }
            else{
            this.addReportModal(people)
            }
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
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

  addReportModal(person){
    let modal = this.modalCtrl.create('ReportPage', person)
    modal.present()
  }

  trackId(index, feed) {
    return feed ? feed.id : undefined;

  }
  presentConfirm(blocked) {
    let alert = this.alertCtrl.create({
      title: 'Confirm Block',
      message: 'Do you want to block this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Block',
          handler: () => {
            this.blockUser(blocked);
          }
        }
      ]
    });
    alert.present();
  }
  blockUser(blocked){
    if (blocked === this.uS.uid){
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: "You can't block yourself",
        buttons: [
          {
            text: 'Ok',
            role: 'cancel',
            handler: () => {
            }
          }
        ]
      });
      alert.present();
    }
    else{
      this.uS.blockUser(blocked).then(()=>{
        this.ngOnInit();
      })
    }
  }
  getFeeds(){
    let output:any =""
    this.feeds = concat(this.uS.getFeed(1,'').pipe(map((feed:any)=>{
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
        this.blockedUsers.forEach(element => {
          if(myelement.postedBy.id === element.blocked){
            myelement.blocked = true;
          }
        });

        this.blockedBy.forEach(element => {
          if(myelement.postedBy.id === element.blockedBy){
            myelement.blocked = true;
          }
        });
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
        this.blockedUsers.forEach(element => {
          if(myelement.postedBy.id === element.blocked){
            myelement.blocked = true;
          }
        });
      });
    }
    output = feed;
    return feed
  }),share()
),
)
  
   
  
    
    
  }
}
