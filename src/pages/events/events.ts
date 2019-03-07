import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController, AlertController, ToastController } from 'ionic-angular';
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
  public sgEvents:Observable<any>;
  public ritEvents;
  public comHEvents;
  public otherEvents;
  public sugEvents;
  public loading:any;
  public user:any;
  public youGoing;
  subscription;
  now;

  constructor(public toastCtrl:ToastController, private barcodeScanner: BarcodeScanner, public modalCtrl: ModalController,public loadingCtrl: LoadingController,public navCtrl: NavController, 
    public navParams: NavParams,public uS: UserserviceProvider,private alertCtrl: AlertController) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
    this.eventHeaderName = "SG Events";
    this.user= ""
    this.youGoing =false;
      
  }
  
  ngOnInit(){
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

  this.showEvents("SG Events");
  
      
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
        this.uS.updateEventGoing(event,this.eventHeaderName,this.uS.uid,false) // remove from going 
      }
      else{
        event.going.push(this.uS.userRef)
        this.uS.updateEventGoing(event,this.eventHeaderName,this.uS.uid,true) // add to going
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
    this.navCtrl.push('FeedbackPage',obj)
  }

  scanBarcode(event){
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
    })
    .catch(err => {
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

  showEvents(name){
    let output:any =""
    let test = false;
    this.eventHeaderName = name;
    // the tabs
  switch (name) {
    case 'SG Events':
      this.sgEvents = this.uS.sgEvents.pipe(map((event:any)=>{
        if(test == false){ // to make sure the postedBy only loads on page enter
          event.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x; 
              test =true;
              output = event;
            })
          if(myelement.going){ //show if you subscribed to go
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          } 
        }); 
        }
        else {
          for (let i = 0; i < event.length; i++) {
            let newEventLength =event.length - output.length
            if(i < newEventLength){ // only get the postedBy for new posts
              this.uS.getRef(event[i].postedBy)
              .subscribe(x=>{
                event[i].postedBy =x;
              })
            }
            else{
              event[i].postedBy = output[i-newEventLength].postedBy // use old postedBy for old posts until page reenter
            }    
          }
          event.forEach(myelement => {  //show if you subscribed to go
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              }
              });
            }
          });
        }
        return event
    }),share()
    )
      break;
    
    case 'RIT Events':
      this.ritEvents = this.uS.ritEvents.pipe(map((event:any)=>{
        if(test == false){ // to make sure the postedBy only loads on page enter
          event.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x; 
              test =true;
              output = event;
            })
          if(myelement.going){ //show if you subscribed to go
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          } 
        }); 
        }
        else {
          for (let i = 0; i < event.length; i++) {
            let newEventLength =event.length - output.length
            if(i < newEventLength){ // only get the postedBy for new posts
              this.uS.getRef(event[i].postedBy)
              .subscribe(x=>{
                event[i].postedBy =x;
              })
            }
            else{
              event[i].postedBy = output[i-newEventLength].postedBy // use old postedBy for old posts until page reenter
            }    
          }
          event.forEach(myelement => {  //show if you subscribed to go
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              }
              });
            }
          });
        }
        return event
      }),share()
      )
      break;
    
    case "Common Hour Events":
      this.comHEvents = this.uS.comHEvents.pipe(map((event:any)=>{
        if(test == false){ // to make sure the postedBy only loads on page enter
          event.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x; 
              test =true;
              output = event;
            })
          if(myelement.going){ //show if you subscribed to go
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          } 
        }); 
        }
        else {
          for (let i = 0; i < event.length; i++) {
            let newEventLength =event.length - output.length
            if(i < newEventLength){ // only get the postedBy for new posts
              this.uS.getRef(event[i].postedBy)
              .subscribe(x=>{
                event[i].postedBy =x;
              })
            }
            else{
              event[i].postedBy = output[i-newEventLength].postedBy // use old postedBy for old posts until page reenter
            }    
          }
          event.forEach(myelement => {  //show if you subscribed to go
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              }
              });
            }
          });
        }
        return event
      }),share()
      )
      break;

    case "Other Events":
      this.otherEvents = this.uS.otherEvents.pipe(map((event:any)=>{
        if(test == false){ // to make sure the postedBy only loads on page enter
          event.forEach(myelement => {
            this.uS.getRef(myelement.postedBy).subscribe(x=>{
              myelement.postedBy =x; 
              test =true;
              output = event;
            })
            if(myelement.going){ //show if you subscribed to go
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              } 
              });
            } 
        }); 
        }
        else {
          for (let i = 0; i < event.length; i++) {
            let newEventLength =event.length - output.length
            if(i < newEventLength){ // only get the postedBy for new posts
              this.uS.getRef(event[i].postedBy)
              .subscribe(x=>{
                event[i].postedBy =x;
              })
            }
            else{
              event[i].postedBy = output[i-newEventLength].postedBy // use old postedBy for old posts until page reenter
            }    
          }
          event.forEach(myelement => {  //show if you subscribed to go
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              }
              });
            }
          });
        }
        return event
      }),share()
      )
      break;
    case "Suggested Events":
      this.sugEvents = this.uS.sugEvents.pipe(map((event:any)=>{
        if(test == false){ // to make sure the postedBy only loads on page enter
          event.forEach(myelement => {
              this.uS.getRef(myelement.postedBy).subscribe(x=>{
                myelement.postedBy =x; 
                test =true;
                output = event;
            })
          if(myelement.going){ //show if you subscribed to go
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          } 
        }); 
        }
        else {
          for (let i = 0; i < event.length; i++) {
            let newEventLength =event.length - output.length
            if(i < newEventLength){ // only get the postedBy for new posts
              this.uS.getRef(event[i].postedBy)
              .subscribe(x=>{
                event[i].postedBy =x;
              })
            }
            else{
              event[i].postedBy = output[i-newEventLength].postedBy // use old postedBy for old posts until page reenter
            }    
          }
          event.forEach(myelement => {  //show if you subscribed to go
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              }
              });
            }
          });
        }
        return event
      }),share()
      )
      break;
  
    default:
      break;
  }
  
    
    
    
    
    
  }
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddEventPage',addObj)
    modal.present()
   
  }
}
