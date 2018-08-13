import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,  AlertController, LoadingController  } from 'ionic-angular';
import { File } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import * as moment from 'moment';

/**
 * Generated class for the AddEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-event',
  templateUrl: 'add-event.html',
  providers: [UserserviceProvider]
})
export class AddEventPage {
  public hasPickedImage: boolean = false;
  public postImg:any;
  public header:string;
  public previewImg:any;
  public uploadPercent:any;
  public title:string;
  public description:string;
  public startTime:any;
  public endTime:any;
  public myDate:any;
  public loading:any;
  public price:any;
  public uploadUrl:Observable<string | null>;
  constructor(public uS : UserserviceProvider,private file: File,public alertCtrl: AlertController, 
    public navCtrl: NavController,public loadingCtrl: LoadingController, public navParams: NavParams,public viewCtrl: ViewController,public camera: Camera) {
    this.header = this.navParams.get('header');
    this.previewImg="";
    this.title = "";
    this.description = "";
    this.myDate ="";
    this.startTime ="";
    this.endTime ="";
    this.price ="";
    
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

  takePhoto() {
      const options : CameraOptions = 
      {
        quality: 80,
        targetHeight: 300,
        targetWidth: 300,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        correctOrientation: true
      }
      this.camera.getPicture(options).then((imageData) => 
      {
        this.previewImg = "data:image/jpeg;base64," + imageData;
          
      }, 
      (err) => 
      {
          console.log(err);
      }); 
    }

  pickImage(){
    const options : CameraOptions = 
    {
      quality: 80,
      targetHeight: 300,
      targetWidth: 300,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.SAVEDPHOTOALBUM,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }
    this.camera.getPicture(options).then((imageData) => 
    {
      this.previewImg = "data:image/jpeg;base64," + imageData;
        
    }, 
    (err) => 
    {
        console.log(err);
    }); 
  }
  

  addEvent(header){

    if(moment(this.myDate +' '+ this.endTime).isSameOrBefore(this.myDate +' '+  this.startTime)){
      let alert = this.alertCtrl.create({
        title: 'Change End Time',
        subTitle:'Start time is greater than or same as end time',
        buttons: ['OK']
      })
      alert.present();
    }
    else{  
      this.presentLoader(true)
      let randName =new Date().getTime().toString()
      const ref = this.uS.uploadImages('Events/'+header+'/'+this.title +randName);
      const task = ref.putString(this.previewImg,'data_url');
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe((myUrl) =>{
            let event={
              description: this.description,
              going:[],
              postImg:myUrl,
              postImgRef:'Events/'+header+'/'+this.title +randName,
              title:this.title,
              type:header
            }
            this.uS.addEvent(event,this.myDate,this.startTime,this.endTime).then((success)=>{
              this.presentLoader(false)
              this.viewCtrl.dismiss();
              })
              .catch(function(error) {
                let alert = this.alertCtrl.create({
                subTitle: error,
                buttons: ['OK']
                });
              alert.present();
            })
          })
        })
      ).subscribe()
      
    }

  } 
}
