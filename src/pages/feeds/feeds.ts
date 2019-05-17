import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,ModalController, IonicPage, AlertController, ActionSheetController, Content, BlockerDelegate, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, share, take} from 'rxjs/operators';


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
  moreFeed;
  old = [];
  complete = false;
  doc;
  n = 10;
  @ViewChild(Content) content: Content;
  resHeight;
  

  constructor(private alertCtrl: AlertController,public uS:UserserviceProvider,
     public navCtrl: NavController,public modalCtrl: ModalController, 
     public actionSheetCtrl: ActionSheetController,public platform: Platform) {

  }

  ionViewWillEnter(){
    this.test = false
    this.old = []
    this.moreFeed = undefined
    this.user =this.uS.db.doc$('users/'+this.uS.uid)
    this.user.subscribe(x => this.theUser = x)
    
    this.test = false;
    this.getBlocked().then(()=>{
      this.getFeeds()
    })
  }

  async ngOnInit(){
    this.resHeight = this.platform.height() *0.7
    this.old = []
    this.n = 10
    this.moreFeed = undefined
    this.user =this.uS.db.doc$('users/'+this.uS.uid)
    this.user.subscribe(x => this.theUser = x)
    
    this.test = false;
    this.getBlocked().then(()=>{
      this.getFeeds()
    })
  
    
    
  }
  getBlocked(){
    return new Promise(resolve => {
      this.uS.getBlockedUser().subscribe((x)=> {
        this.blockedUsers = x
        this.blockedUsers
      })
    this.uS.getOtherBlockedUser().pipe(take(1)).subscribe(x=>{
      this.blockedBy = x;
      resolve(this.blockedBy)
    })
  })
  }

  doRefresh(refresher){
    this.old = []
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
          }
        }
      ]
    });
    actionSheet.present();
  }

  like(feed){
      if(feed.youLike==true){
        feed.likes = feed.likes.filter((likes)=> {return likes.path!=this.uS.userRef.path})
        this.uS.checkDocExists('feeds/',feed.id).then(val=>{
          if(val ===true){
            this.uS.updateFeedLike(feed).then(()=>{
              feed.youLike = false;
            })
          }
          else{
            let alert = this.alertCtrl.create({
              title: 'Feed Deleted',
              message: "Sorry this feed has been deleted by the user",
              buttons: [
                {
                  text: 'Ok',
                  role: 'cancel',
                  handler: () => {
                    this.ngOnInit()
                  }
                }
              ]
            });
            alert.present();
          }
      
      })
      }
      else{
        feed.likes.push(this.uS.userRef)
        feed.youLike = true;
        this.uS.checkDocExists('feeds/',feed.id).then(val=>{
          if(val ===true){
            this.uS.updateFeedLike(feed).then(()=>{
              feed.youLike = true;
            })
          }
          else{
            let alert = this.alertCtrl.create({
              title: 'Feed Deleted',
              message: "Sorry this feed has been deleted by the user",
              buttons: [
                {
                  text: 'Ok',
                  role: 'cancel',
                  handler: () => {
                    this.ngOnInit()
                  }
                }
              ]
            });
            alert.present();
          }
        })
      }

  }

  toComments(header,id,likes){
    let obj ={
      header:header,
      eventId: id,
      type:'feed',
      likes: likes
    }
    this.uS.checkDocExists('feeds/',id).then(val=>{
      if(val ===true){
        this.navCtrl.push('FeedbackPage',obj)
      }
      else{
        let alert = this.alertCtrl.create({
          title: 'Feed Deleted',
          message: "Sorry this feed has been deleted by the user",
          buttons: [
            {
              text: 'Ok',
              role: 'cancel',
              handler: () => {
                this.ngOnInit()
              }
            }
          ]
        });
        alert.present();
      }
    })
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
    modal.onWillDismiss(()=>{
    this.ngOnInit()
    })
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

  getLast(doc){
    this.doc = doc
  }

 async doInfinite(infiniteScroll){
  let load =0 // to check if command started here or at observable
    this.moreFeed = this.uS.getFeed(1,this.doc,this.n).pipe(map((feed:any)=>{
        feed.forEach(myelement => {
          if(myelement.postedBy.path){
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x;
            })
          }
        });
      feed.forEach(myelement => {
        if(load ===0){
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
          if(myelement.blocked!=true){
            this.old.push(myelement);
          }
        }
      });
      load =1;
      this.old.forEach((myelement,i) => {
      if(myelement.likes){
        myelement.likes.forEach(element => { 
        if(element.path==this.uS.userRef.path){
          myelement.youLike = true;
        } 
        });
      }
    });
      return this.old
    }),share()
    )
    this.moreFeed.subscribe(x => {
        infiniteScroll.complete();
    })
  }
 

  getFeeds(){
    this.old = []
    let load =0 // to check if command started here or at observable
    let output:any =""
    this.feeds = this.uS.getFeed(0,'',this.n).pipe(map((feed:any)=>{
      feed.forEach((myelement,i) => {
        if(myelement.postedBy.path){
          this.uS.getRef(myelement.postedBy).subscribe(x=>{
            myelement.postedBy =x;
          })
        }
        if(load ===0){
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
            if(myelement.blocked!=true){
              this.old.push(myelement);
            }
        }
      })
      load =1;
      this.old.forEach((myelement,i) => {
        if(myelement.likes){
          myelement.likes.forEach(element => { 
          if(element.path==this.uS.userRef.path){
            myelement.youLike = true;
          } 
          });
        }
 
      });
      if(this.old.length<=8){
        if(feed.length<this.n){
          //do nothing
        }
        else{
          this.n+=1
          if(this.n<=50){
            this.getFeeds();
          }
        }
      }
    output = feed;
    return feed
  }),share()
)

  
   
  
    
    
  }
}
