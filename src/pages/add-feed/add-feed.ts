import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ViewController, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { finalize } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the AddFeedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-feed',
  templateUrl: 'add-feed.html',
})
export class AddFeedPage {
  public header:string;
  public previewImg="";
  public description = "";
  public loading:any;
  public post:string ="";
  constructor(public uS : UserserviceProvider,public navCtrl: NavController,public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
   public navParams: NavParams,public viewCtrl: ViewController,public camera: Camera) {
    this.header = this.navParams.get('header');
  }

  ionViewDidLoad() {

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
        quality: 95,
        targetHeight: 400,
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
        let alert = this.alertCtrl.create({
          subTitle: 'There was an error',
          buttons: ['OK']
          });
        alert.present();
      }); 
    }

  pickImage(){
    const options : CameraOptions = 
    {
      quality: 98,
      targetHeight: 400,
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
      let alert = this.alertCtrl.create({
        subTitle: 'There was an error',
        buttons: ['OK']
        });
      alert.present();
    }); 
  }
  
  addFeeds(){
    let randName = new Date().getTime().toString()
    this.presentLoader(true)
    if (this.previewImg ==""){
      let feed={
        description: this.post,
        likes:[],
        postedBy:this.uS.userRef,
        postedByUid : this.uS.uid
      }
      this.uS.addFeed(feed).then(()=>{
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
    }
    else{
      const ref = this.uS.uploadImages('FeedsImages/'+this.uS.userName+'/'+this.uS.uid+'/'+randName);
      const task = ref.putString(this.previewImg,'data_url');
      
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe((myUrl) =>{
            let feed={
              description: this.post,
              likes:[],
              postedBy:this.uS.userRef,
              postImg:myUrl,
            }
            this.uS.addFeed(feed).then(()=>{
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
          })
        })
      ).subscribe()
    }
  }       
}
