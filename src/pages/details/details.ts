import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapOptions, Marker } from '@ionic-native/google-maps';





@IonicPage()
@Component({
  selector: 'page-details',
  templateUrl: 'details.html',
})
export class DetailsPage implements OnInit {

  public header:string;
  public img:string;
  public about:string;
  public type:string;
  public deal:string;
  public location:any;
  map: GoogleMap;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController) {
    this.header= this.navParams.get('header');
    this.img = this.navParams.get('pic');
    this.about = this.navParams.get('about');
    this.type = this.navParams.get('type');
    this.deal = this.navParams.get('deal')
    this.location = this.navParams.get('location')
  }

  ionViewDidLoad(){
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

  

  
 

}
