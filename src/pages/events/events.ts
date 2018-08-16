import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController,ModalController, AlertController } from 'ionic-angular';
import { AddEventPage } from '../add-event/add-event';
import { map} from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Observable } from 'rxjs';
import { FeedbackPage } from '../feedback/feedback';

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
  public sgEvents:Observable<any>;
  public ritEvents;
  public comHEvents;
  public otherEvents;
  public sugEvents;
  public loading:any;
  public user;
  public youGoing;
  subscription;

  constructor(public modalCtrl: ModalController,public loadingCtrl: LoadingController,public navCtrl: NavController, 
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
  
  }
  going(event){
    if(event.price==''){
      if(event.youGoing==true){
        event.going = event.going.filter((going)=> {return going.path!=this.uS.userRef.path})
      this.uS.updateEventGoing(event)
      }
      else{
        event.going.push(this.uS.userRef)
        this.uS.updateEventGoing(event)
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
  toFeedback(header,id){
    let obj ={
      header:header,
      eventId: id
    }
    this.navCtrl.push(FeedbackPage,obj)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventsPage');
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }
 
  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

  showEvents(name){
    this.eventHeaderName = name;
    switch (name) {
      case "SG Events":
        if(!this.sgEvents){
          this.sgEvents = this.uS.sgEvents.pipe(map((event:any)=>{
            event.forEach(myelement => {
             
                this.uS.getRef(myelement.postedBy).subscribe(x=>{
                  myelement.postedBy =x;
                 
              })
           
            if(myelement.going){
              myelement.going.forEach(element => { 
              if(element.path==this.uS.userRef.path){
                myelement.youGoing = true;
              } 
              });
            }
          }); 
            return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
          }))
        }
        break;
      case "RIT Events":
      if(!this.ritEvents){
        let test =false
        let output:any =""
        this.ritEvents = this.uS.ritEvents.pipe(map((event:any)=>{
          event.forEach(myelement => {
            if (test==false) {
                this.uS.getRef(myelement.postedBy).subscribe(x=>{
                  myelement.postedBy =x;
                  test =true;
                  output =x;
              })
            }
            else{
              myelement.postedBy = output
            }
          if(myelement.going){
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          }
        }); 
          return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
        }))
      }
        break;
      case "Common Hour Events":
      if(!this.comHEvents){
        let test =false
        let output:any =""
        this.comHEvents = this.uS.comHEvents.pipe(map((event:any)=>{
          event.forEach(myelement => {
            if (test==false) {
                this.uS.getRef(myelement.postedBy).subscribe(x=>{
                  myelement.postedBy =x;
                  test =true;
                  output =x;
              })
            }
            else{
              myelement.postedBy = output
            }
          if(myelement.going){
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          }
        }); 
          return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
        }))
      }
        break;
      case "Other Events":
      if(!this.otherEvents){
        let test =false
        let output:any =""
        this.otherEvents = this.uS.otherEvents.pipe(map((event:any)=>{
          event.forEach(myelement => {
            if (test==false) {
                this.uS.getRef(myelement.postedBy).subscribe(x=>{
                  myelement.postedBy =x;
                  test =true;
                  output =x;
              })
            }
            else{
              myelement.postedBy = output
            }
          if(myelement.going){
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          }
        }); 
          return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
        }))
      }
        break;
      case "Suggested Events":
      if(!this.sugEvents){
        let test =false
        let output:any =""
        this.sugEvents = this.uS.sugEvents.pipe(map((event:any)=>{
          event.forEach(myelement => {
            if (test==false) {
                this.uS.getRef(myelement.postedBy).subscribe(x=>{
                  myelement.postedBy =x;
                  test =true;
                  output =x;
              })
            }
            else{
              myelement.postedBy = output
            }
          if(myelement.going){
            myelement.going.forEach(element => { 
            if(element.path==this.uS.userRef.path){
              myelement.youGoing = true;
            } 
            });
          }
        }); 
          return event.sort(function(a, b){return b.createdAt.seconds - a.createdAt.seconds})
        }))
      }
        break;
    
      default:
        break;
    }
  }
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddEventPage,addObj)
    modal.present()
   
  }
}
