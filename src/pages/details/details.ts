import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, Platform } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapOptions, Marker } from '@ionic-native/google-maps';
import { Subject } from 'rxjs';
import { UserserviceProvider } from '../../providers/userservice/userservice';



declare var google


@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage implements AfterViewInit {

  @ViewChild('map_canvas') mapElement: ElementRef;
  iosMap: any;
  public header:string;
  public img:string;
  public about:string;
  public type:string;
  public deal:string;
  public location:any;
  public id;
  map: GoogleMap;
  public obj:any ='';
  

  constructor(public uS:UserserviceProvider, public loadingCtrl:LoadingController, public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController,public platform:Platform) {
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
    if(this.platform.is('android')){
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
        },
        tilt: 30
        
      });
      
      marker.showInfoWindow();
    }
    else{
      let latLng = new google.maps.LatLng(-34.9290, 138.6010);

      let mapOptions = {
        center: latLng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.iosMap = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
      var marker = new google.maps.Marker({position: latLng, map: this.iosMap, animation: google.maps.Animation.BOUNCE});

    }
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
