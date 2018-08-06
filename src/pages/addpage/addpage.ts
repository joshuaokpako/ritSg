import { Component, ViewChild,ElementRef } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController, LoadingController} from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { Geolocation } from '@ionic-native/geolocation';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Base64 } from '@ionic-native/base64';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

declare var google: any;

@Component({
  selector: 'page-addpage',
  templateUrl: 'addpage.html',
})
export class AddpagePage {
  public location:any;
  public header:string;
  public previewImg:any;
  public uploadPercent:any;
  public groupName:string;
  public description:string;
  public type:any;
  public inputlocation:string;
  public deal:any;
  public loading:any;
  public uploadUrl:Observable<string | null>;
  search: boolean = false;
  addressElement: HTMLInputElement = null;
  listSearch: string = '';
 

  constructor(public uS : UserserviceProvider,public navCtrl: NavController,public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
    private imagePicker: ImagePicker, public navParams: NavParams,public viewCtrl: ViewController,public camera: Camera,private base64: Base64) {
  this.previewImg ='';
  this.header = this.navParams.get('header');
  }

  ionViewDidLoad(){
    if (this.header =="RIT Deals") {
      if (!!google) {
        this.initAutocomplete();
      } else {
        this.errorAlert('Error', 'Something went wrong with the Internet Connection. Please check your Internet.')
      }
      
    }
    

  }
  errorAlert(title, message) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            this.initAutocomplete();
          }
        }
      ]
    });
    alert.present();
  }

  mapsSearchBar(ev: any) {
    // set input to the value of the searchbar
    //this.search = ev.target.value;
    console.log(ev);
    const autocomplete = new google.maps.places.Autocomplete(ev);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          sub.next(place.geometry.location);
          sub.complete();
        }
      });
    });
  }

  initAutocomplete(): void {
    // reference : https://github.com/driftyco/ionic/issues/7223
    this.addressElement = <HTMLInputElement>document.getElementsByClassName("text-input")[3]
    this.createAutocomplete(this.addressElement).subscribe((location) => {
      console.log('Searchdata', location);
    });
  }

  createAutocomplete(addressEl: HTMLInputElement): Observable<any> {
    let defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(23.11150760505184, 52.505126953125),
      new google.maps.LatLng(23.73723793168785, 55.38240430318797));
    
    
    let options = {
      bounds: defaultBounds,
      types: ['establishment']
    };
    const autocomplete = new google.maps.places.Autocomplete(addressEl, options);
    return new Observable((sub: any) => {
      google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
          sub.error({
            message: 'Autocomplete returned place with no geometry'
          });
        } else {
          this.inputlocation = place.formatted_address;
          console.log('Search Lng', place.geometry.location.lng());
          sub.next(this.location={latitude:place.geometry.location.lat(),longitude:place.geometry.location.lng()});
          //sub.complete();
        }
      });
    });
  }

  dismiss(){
    this.viewCtrl.dismiss();
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

  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Choose a Picture',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.takePhoto() 
          }
        },
        {
          text: 'Choose from Gallery',
          handler: () => {
            this.pickImage();
          }
        }
      ]
    });
    alert.present();
  }

  takePhoto() 
    {
      const options : CameraOptions = 
      {
        quality: 80,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
      this.camera.getPicture(options) .then((imageData) => 
      {
          this.previewImg = "data:image/jpeg;base64," + imageData;
          
      }, 
      (err) => 
      {
          console.log(err);
      }); 
    }

  pickImage(){
    this.imagePicker.hasReadPermission().then((result) =>{
      if(result==true){
        let options = {
          maximumImagesCount: 1,
          }
          let base64="";
          
          this.imagePicker.getPictures(options).then((results) => {
            let filePath: string = results;
            this.base64.encodeFile(filePath).then((base64File: string) => {
              base64 = base64File;
            }, (err) => {
              console.log(err);
            });
            this.previewImg ='data:image/jpeg;base64,' +  base64
          },
          (err) => { });
      }
      else{
        this.imagePicker.requestReadPermission();
      }
    })
  }
  
  addGroup(header){
    this.presentLoader(true)
    const ref = this.uS.uploadImages('clubImages/'+header+'/'+this.groupName);
    const task = ref.putString(this.previewImg,'data_url');
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe((myUrl) =>{this.uploadUrl=myUrl
          switch (header) {
            case "RIT Athletics":
              this.uS.addGroup(header,this.groupName,this.description,this.uploadUrl).then((success)=>{
                this.presentLoader(false)
                this.viewCtrl.dismiss();
                })
                .catch(function(error) {
                  this.presentLoader(false)
                  let alert = this.alertCtrl.create({
                  subTitle: error,
                  buttons: ['OK']
                  });
                alert.present();
              })
              break;
            case "RIT Clubs":
              this.uS.addGroup(header,this.groupName,this.description,this.uploadUrl,this.type).then((success)=>{
                this.presentLoader(false)
                this.viewCtrl.dismiss();
                })
                .catch(function(error) {
                  this.presentLoader(false)
                  let alert = this.alertCtrl.create({
                  subTitle: error,
                  buttons: ['OK']
                  });
                alert.present();
              })
              break;
          
            case "RIT Deals":
              this.uS.addGroup(header,this.groupName,this.description,this.uploadUrl,this.location,this.deal).then((success)=>{
                this.presentLoader(false)
                this.viewCtrl.dismiss();
                })
                .catch(function(error) {
                  this.presentLoader(false)
                  let alert = this.alertCtrl.create({
                  subTitle: error,
                  buttons: ['OK']
                  });
                alert.present();
              })
              break;
            default:
              break;
              
          }
         
        })
      })
    ).subscribe()
         

   
  }
  
}
