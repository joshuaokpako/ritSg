import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController,  AlertController, LoadingController  } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Base64 } from '@ionic-native/base64';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

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
  public header:string;
  public previewImg:any;
  public uploadPercent:any;
  public title:string;
  public description:string;
  public myTime:any;
  public myDate:any;
  public loading:any;
  public uploadUrl:Observable<string | null>;
  constructor(public uS : UserserviceProvider,private imagePicker: ImagePicker,public alertCtrl: AlertController, 
    public navCtrl: NavController,public loadingCtrl: LoadingController, public navParams: NavParams,public viewCtrl: ViewController,public camera: Camera,private base64: Base64) {
    this.header = this.navParams.get('header');
    this.previewImg="";
    this.title = "";
    this.description = "";
    this.myDate ="";
    this.myTime ="";
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


  dismiss(){
    this.viewCtrl.dismiss();
  }
  
  

  
  pickImage(){
    this.imagePicker.hasReadPermission().then((result) =>{
      if(result==true){
        let options = {
          maximumImagesCount: 1,
          }
          let base64="";
          let filePath: string ="";
          
          this.imagePicker.getPictures(options).then((results) => filePath = results)
          .then(()=>{
            this.base64.encodeFile(filePath).then((base64File: string) => {
              base64 = base64File;
              this.previewImg = base64
            }, 
            (err) => {
              console.log(err);
            });
            
          },
          (err) => { });
            
            
      }
      else{
        this.imagePicker.requestReadPermission();
      }
    })
    
  }

  addEvent(header){
    this.presentLoader(true)
    let date = this.myDate + " " +this.myTime
    console.log(date)
    let randName =new Date().getTime()
    const ref = this.uS.uploadImages('Events/'+header+'/'+this.title +randName);
    const task = ref.putString(this.previewImg,'data_url');
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe((myUrl) =>{this.uploadUrl=myUrl
          this.uS.addEvent(header,this.title,this.description,this.uploadUrl,date).then((success)=>{
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
