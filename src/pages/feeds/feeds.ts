import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController,ModalController, IonicPage, AlertController, ActionSheetController, Content, BlockerDelegate } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, share, take, concat} from 'rxjs/operators';
import { Observable, merge } from 'rxjs';

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
  n = 2;
  @ViewChild(Content) content: Content;
  

  constructor(private alertCtrl: AlertController,public uS:UserserviceProvider, public navCtrl: NavController,public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController) {

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
    this.old = []
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
        if(this.blockedUsers.length>0){
          this.n =this.n*(this.blockedUsers.length+10)
          console.log(this.n)
        }
        resolve(this.blockedUsers)
      })
    this.uS.getOtherBlockedUser().pipe(take(1)).subscribe(x=>{
      this.blockedBy = x;
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
      this.uS.updateFeedLike(feed).then(()=>{
        feed.youLike = false;
      })
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

  getLast(doc){
    this.doc = doc
  }

 async doInfinite(infiniteScroll){
  let load =0 // to check if command started here or at observable
    console.log(this.doc)
    let output:any =""
    this.moreFeed = await this.uS.getFeed(1,this.doc,this.n).pipe(map((feed:any)=>{
        feed.forEach(myelement => {
          if(myelement.postedBy.path){
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x;
              this.test =true;
              output = feed;
            })
          }
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

      /*else {
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
      }*/
      output = feed;
      feed.forEach(element => {
        this.old.forEach(myelement => {
          if(myelement.id ==element.id){
            load = 1;
          }
        })
        if(load ===0){
          this.old.push(element);
        }
        
      });
      this.old.forEach(myelement => {
      if(myelement.likes){
        myelement.likes.forEach(element => { 
        if(element.path==this.uS.userRef.path){
          myelement.youLike = true;
        } 
        });
      }
      

      this.blockedBy.forEach(element => {
        if(myelement.postedBy.id === element.blockedBy){
          myelement.blocked = true;
        }
      });
    });
      return this.old
    }),share()
  )
  await this.moreFeed.subscribe(x => {
    console.log(x)
    

    infiniteScroll.complete();
  }
    )
    

  }
  getFirst(){
   
  }

  getIndex(i){
    console.log('hey')
    console.log(i)
  }

  async getFeeds(){
    let load =0 // to check if command started here or at observable
    let output:any =""
    this.feeds = this.uS.getFeed(0,'',this.n).pipe(take(1),map(async (feed:any)=>{
      feed.forEach(myelement => {
        console.log(feed)
        if(myelement.postedBy.path){
          this.uS.getRef(myelement.postedBy).subscribe(x=>{
            myelement.postedBy =x;
            this.test =true;
            output = feed;
          })
          this.old.forEach(thelement => {
            if(thelement.id ==myelement.id){
              load = 1;
            }
          })
          if( this.old[0] !==feed[0] && load!== 0){
            load = 2;
            this.old.forEach(thelement => {
              if(thelement.id ===feed[0].id){
                console.log('i am here')
                load = 4;
              }
            })
            if (load ===2){
              console.log(this.old)
              this.old.unshift(feed[0]);
            }
          }
          else if(load ===0){
            console.log('yo')
            //this.old.push(myelement);
          }
         
        }
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
      let blocked = []
      feed.forEach(element => {
        if(element.blocked){
          blocked.push(element)
          console.log(blocked)
          if(blocked.length > this.n){
            this.n += blocked.length
            console.log(this.n)
            this.ngOnInit()
          }
        }
        
      });
      this.old.forEach(myelement => {
        if(myelement.likes){
          myelement.likes.forEach(element => { 
          if(element.path==this.uS.userRef.path){
            myelement.youLike = true;
          } 
          });
        }
        let blocked = []
     this.blockedUsers.forEach(element => {
        if(myelement.postedBy.id === element.blocked){
          myelement.blocked = true;
          blocked.push(myelement)
          this.n += blocked.length
          if(this.n-blocked.length<=3){
            console.log(this.n)
            this.ngOnInit()
          }
        }
      });
  
        this.blockedBy.forEach(element => {
          if(myelement.postedBy.id === element.blockedBy){
            myelement.blocked = true;
          }
        });
      });
      
   /* }
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
    }*/
    output = feed;
    return feed
  }),share()
)

  
   
  
    
    
  }
}
