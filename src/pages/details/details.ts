import { Component, AfterViewInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapOptions, Marker } from '@ionic-native/google-maps';
import { Subject } from 'rxjs';
import { UserserviceProvider } from '../../providers/userservice/userservice';






@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage implements AfterViewInit {

  public header:string;
  public img:string;
  public about:string;
  public type:string;
  public deal:string;
  public location:any;
  public id;
  map: GoogleMap;
  public obj:any ='';
  

  constructor(public uS:UserserviceProvider, public loadingCtrl:LoadingController, public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController) {
    this.header= this.navParams.get('header');
    this.img = this.navParams.get('pic');
    this.about = this.navParams.get('about');
    this.type = this.navParams.get('type');
    this.id = this.navParams.get('id');
    this.deal = this.navParams.get('deal')
    this.location = this.navParams.get('location')
    this.obj = this.navParams.get('obj') // the club or athletics obj
 
  }

  ngAfterViewInit(){
    if (this.type=="RIT Deals"){
      this.loadMap();
    }
    
  }
  ngOnInit(){}

  loadMap() {
    
    let mapOptions: GoogleMapOptions = {
      camera: {
         target: {
           lat: this.location.latitude,
           lng: this.location.longitude
         },
         zoom: 18,
         tilt: 30
       }
    };
    // Create a map after the view is ready and the native platform is ready.
    this.map = GoogleMaps.create('map_canvas', mapOptions);


      let marker: Marker = this.map.addMarkerSync({
      title: this.header,
      icon: 'red',
      animation: 'BOUNCE',
      position: {
        lat: this.location.latitude,
        lng:  this.location.longitude
      }
    });
    
    marker.showInfoWindow();
  }

  viewMembers(){
    let clubId = {
      clubId:this.id,
      header:'Details'
    }
    this.navCtrl.push('ViewMembersPage', clubId)
  }

  joinClub(){
  var loader = this.loadingCtrl.create({
    content: "Please wait..."
  });
  loader.present();
  let observer = new Subject();
      let userRef = this.uS.getUserRef(this.uS.uid)
        this.uS.joinClub(userRef,'',this.id).then(x=>{ // adding to club
          loader.dismiss()
          let alert = this.alertCtrl.create({
            title: 'Joined Club',
            subTitle: 'You have Joined ' + this.header,
            buttons: ['OK']
          })
          alert.present()
          observer.next()
          observer.complete()
        }).catch((error)=>{
          loader.dismiss()
          let alert = this.alertCtrl.create({
            title: "error",
            subTitle: 'There was an error',
            buttons: ['OK']
          })
          alert.present()
          observer.next()
          observer.complete()
        })
  }
  

  
 

}
