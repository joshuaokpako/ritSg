import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { GoogleMaps, GoogleMap, GoogleMapsEvent, Marker } from '@ionic-native/google-maps';





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
    
    
    // Create a map after the view is ready and the native platform is ready.
    let element: HTMLElement = document.getElementById("map_canvas");
    console.log(element)
    this.map = GoogleMaps.create(element);
    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {


      console.log('map is ready to use.');


    });

    /*let marker: Marker = this.map.addMarkerSync({
      title: this.header,
      icon: 'red',
      animation: 'BOUNCE',
      position: {
        lat: this.location.latitude,
        lng:  this.location.longitude
      }
    });
    
    marker.showInfoWindow();*/
  }

  

  
 

}
