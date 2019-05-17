import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController, AlertController, ToastController, Platform } from 'ionic-angular';
import { map, share,takeUntil} from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Observable, Subject } from 'rxjs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

/**
 * Generated class for the EventsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
  providers: [UserserviceProvider]
})
export class EventsPage implements OnInit {
  public eventHeaderName:string;
  tabBarElement:any;
  observer:Subject<any> = new Subject();
  public events;
  public loading:any;
  public user:any;
  public youGoing;
  subscription;
  doc;
  now;
  n =3;
  eventLoaded = false;
  moreEvents;
  canLeave=true;
  resHeight;

  constructor(public toastCtrl:ToastController, private barcodeScanner: BarcodeScanner, 
    public modalCtrl: ModalController,public loadingCtrl: LoadingController,public navCtrl: NavController, 
    public navParams: NavParams,public uS: UserserviceProvider,
    private alertCtrl: AlertController, public platform: Platform) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.eventHeaderName = "SG Events";
    this.user= ""
    this.youGoing =false;
      
  }

  ionViewCanLeave(){
    return this.canLeave
  }
  
  ngOnInit(){
    this.resHeight = this.platform.height() *0.7
    this.subscription = this.uS.user.pipe(map((user:any)=>{
     if (user.groupAdmin){
        user.groupAdmin.forEach(element => {
          switch (element) {
            case "SG":
              user.SG=true
              break;
            default:
              console.log("didn't work")
              break;
            }
        });
        
      }
      return user    
    })).subscribe(x=>this.user=x )

  this.showEvents(this.eventHeaderName);
  
      
  }

  ngOnDestroy() { 
   if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.observer.next()
    this.observer.complete()
  
  }

  goingPaid(event){
    let alert = this.alertCtrl.create({
      title: 'User Email',
      message: "Add user to going list",
      inputs: [
        {
          name: 'userEmail',
          placeholder: 'user email '
        }
      ],
      buttons: [
          {
          text: 'Add users to going',
          handler: (data) => {
            this.addPaidGoing(event,data.userEmail) 
          }
        }
      ]
    })
    alert.present()
  }

  addPaidGoing(event,email){
    let observer = new Subject();
    let userEmail = email.trim().replace(/\s+/g, "").toLowerCase()
    this.uS.getUser(userEmail).pipe(takeUntil(observer)).subscribe((user:any)=>{
      if (user.length != 0){
        let userRef = this.uS.getUserRef(user[0].uid)
        if(event.going.length ==0){
          event.going.push(userRef)
          this.uS.updateEventGoing(event,this.eventHeaderName,user[0].uid,true).then(x=>{ // adding to going
            event.youGoing= true;
            observer.next()
            observer.complete()
          }).catch((error)=>{
            console.log(error)
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
        else{
        let userGoing =false
        for (let index = 0; index <  event.going.length; index++) {
          if(event.going[index].path === userRef.path ){
            console.log(event.going[index].path)
            console.log(index)
            userGoing  = true
            let alert = this.alertCtrl.create({
              title: 'User already going',
              subTitle: user[0].fullName +  ' is already going for this event. Would you like to remove this user from the going list?',
              buttons: [
                {
                  text: 'YES',
                  handler: () => {
                    event.going = event.going.filter((going)=> {return going.path!= userRef.path})
                    this.uS.updateEventGoing(event,this.eventHeaderName,user[0].uid,false) // remove from going
                    event.youGoing= false;
                  }
                },
                {
                  text: 'NO',
                  role: 'cancel',
                }
              ]
            })
            alert.present();
            observer.next()
            observer.complete()   
            break;
          }
          continue;
        }
        if (userGoing ===false){
          event.going.push(userRef)
          this.uS.updateEventGoing(event,this.eventHeaderName,user[0].uid,true).then(x=>{ //add to going
            event.youGoing= true;
            observer.next()
            observer.complete()
          }).catch(()=>{
            let alert = this.alertCtrl.create({
              title: 'Error',
              subTitle: 'There was an error',
              buttons: ['OK']
            })
            alert.present()
            observer.next()
            observer.complete()
          })
        }
      }
    }
      else{
        let alert = this.alertCtrl.create({
          title: 'Non Existing User',
          subTitle: 'This User does not exist',
          buttons: ['OK']
        })
        alert.present()
        observer.next()
        observer.complete()   
      }
    })
     
  }

  going(event){
    if(event.price==''){
      if(event.youGoing==true){
        event.going = event.going.filter((going)=> {return going.path!=this.uS.userRef.path})
        this.uS.checkDocExists('events/'+this.eventHeaderName+'/'+this.eventHeaderName+'/',event.id).then(val=>{
          if(val ===true){
            this.uS.updateEventGoing(event,this.eventHeaderName,this.uS.uid,true).then((ev)=>{// add to going
              event.youGoing= false;
            })
          }
          else{
            let alert = this.alertCtrl.create({
              title: 'Event Deleted',
              message: "Sorry this event has been deleted by the user",
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
        event.going.push(this.uS.userRef)
        this.uS.checkDocExists('events/'+this.eventHeaderName+'/'+this.eventHeaderName+'/',event.id).then(val=>{
          if(val ===true){
            this.uS.updateEventGoing(event,this.eventHeaderName,this.uS.uid,true).then((ev)=>{// add to going
              event.youGoing= true;
            })
          }
          else{
            let alert = this.alertCtrl.create({
              title: 'Event Deleted',
              message: "Sorry this event has been deleted by the user",
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
    else{
      let alert = this.alertCtrl.create({
        title: 'Pay At Desk',
        subTitle: 'This is a paid event and you would need to pay a fee of '+event.price + ' AED at the SG desk on first floor',
        buttons: ['OK']
      })
      alert.present();
    }
  }
  presentLoader(toggle){
    
    if (toggle ==true){
      this.loading = this.loadingCtrl.create({
        content: 'Loading...',
        showBackdrop: false
      });
      this.loading.present()
    }
    else{
      this.loading.dismiss();
    }

  }
  toFeedback(header,id,going){
    let obj ={
      header:header,
      eventId: id,
      type:this.eventHeaderName,
      likes: going
    }
    this.uS.checkDocExists('events/'+this.eventHeaderName+'/'+this.eventHeaderName+'/',id).then(val=>{
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

  scanBarcode(event){
    this.canLeave = false;
    let observer = new Subject()
    let test = false
    this.barcodeScanner.scan({resultDisplayDuration:0,showTorchButton:true}).then(barcodeData => {
      let data = this.uS.encrypt(barcodeData.text)
      if(!barcodeData.cancelled){
         this.uS.checkStudentId(data).pipe(takeUntil(observer)).subscribe((student:any)=>{
          if (test == false){
            if(student.length!=0){
              this.uS.checkEventAttended(event,student[0].uid).pipe(takeUntil(observer)).subscribe((ev:any)=>{
                if(ev){
                  if(ev.eventAttended ===false){
                  test = true
                  this.uS.updateSpiritPoints('Attended Event',student[0].uid,15)
                  this.uS.updateEventGone(event.id, student[0].uid).then(()=>{
                    const toast = this.toastCtrl.create({
                      message: 'Scan Successful',
                      duration: 5000,
                      position: "top",
                      cssClass: "successToast"
                    });
                    toast.present();
                    observer.next()
                    observer.complete()
                    
                  }).catch(()=>{
                    let alert = this.alertCtrl.create({
                      title: 'Error',
                      subTitle: 'There was an error',
                      buttons: ['OK']
                    })
                    alert.present()
                    observer.next()
                    observer.complete()
                  }) 
                  
                  }
                  else{
                    if(test ===true){
                      observer.next()
                      observer.complete()
                    }
                    else{
                      let alert = this.alertCtrl.create({
                        title: 'Already Attended',
                        subTitle: 'This user has already attended this event',
                        buttons: ['OK']
                      })
                      alert.present();
                      observer.next()
                      observer.complete() 
                    }
                  }
                }
                else{
                  let alert = this.alertCtrl.create({
                    title: 'Not Going',
                    subTitle: 'This user has not declared they are going for this event',
                    buttons: ['OK']
                  })
                  alert.present();
                  observer.next()
                  observer.complete() 
                }
              })
            }
            else{
              let alert = this.alertCtrl.create({
                title: 'Non Existing User',
                subTitle: 'This User does not exist or has not verified their id',
                buttons: ['OK']
              })
              alert.present();
              observer.next()
              observer.complete() 
            }
          }
          else{
            observer.next()
            observer.complete()
          }
        })
      }
    }).then(()=>{
      this.canLeave = true;
    })
    .catch(err => {
      this.canLeave = true;
      let alert = this.alertCtrl.create({
        title: 'Error',
        subTitle: err,
        buttons: ['OK']
      })
      alert.present();
      observer.next()
      observer.complete() 

    });
    
  }

  ionViewDidLoad() {
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
    this.now = new Date().getTime()
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }
  getLast(doc){
    this.doc = doc
  }

  
 async doInfinite(infiniteScroll){
  let load =0 // to check if command started here or at observable
    this.moreEvents = this.uS.getEvents( this.eventHeaderName,1,this.doc,this.n).pipe(map((event:any)=>{
        event.forEach(myelement => {
          if(myelement.postedBy.path){
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x;
            })
          }
        });
      event.forEach(myelement => {
          this.events.push(myelement);
        })
      load =1;
      this.events.forEach(myelement => {
        if(myelement.going){ //show if you subscribed to go
          myelement.going.forEach(element => { 
          if(element.path==this.uS.userRef.path){
            myelement.youGoing = true;
          } 
          });
        } 
      })
    
      return this.events
    }),share()
    )
    this.moreEvents.subscribe(x => {
        infiniteScroll.complete();
    })
  }

  showEvents(name){
    let output:any =""
    let test = false;
    this.eventHeaderName = name;
    // the tabs
    this.eventLoaded = false
    this.events = []
    let load =0 // to check if command started here or at observable
       this.uS.getEvents(name,0,'',this.n).pipe(map((event:any)=>{
          event.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x; 
              test =true;
              output = event;
            })
            if(load ===0){
              this.events.push(myelement)
            }
          }); 
          load = 1;
          this.events.forEach(myelement => {
            if(myelement.going){ //show if you subscribed to go
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              } 
              });
            } 
          })
        
        return event
    }),share()
    ).subscribe(()=>{
      this.eventLoaded = true;
    })
    
  }
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddEventPage',addObj)
    modal.present()
   
  }
}
