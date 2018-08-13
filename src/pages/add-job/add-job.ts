import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ViewController, LoadingController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { finalize } from 'rxjs/operators';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the AddJobPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-job',
  templateUrl: 'add-job.html',
})
export class AddJobPage {

  public previewImg="";
  public description = "";
  public loading:any;
  public company:string ="";
  public pickedImage: boolean = false;
  constructor(public uS : UserserviceProvider,public navCtrl: NavController,public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
    private imagePicker: ImagePicker, public navParams: NavParams,public viewCtrl: ViewController,public camera: Camera) {}
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddJobPage');
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
          this.previewImg = "data:image/jpeg;base64," + imageData;4
          this.pickedImage = true
          
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
          width: 500,
          height: 500,
          quality: 80,
          outputType: 1
        }
          
          this.imagePicker.getPictures(options).then((results) => {
            this.previewImg = 'data:image/jpeg;base64,' + results[0]
            this.pickedImage = true
            }, (err) => {
              console.log(err);
            });
            
     
      }
      else{
        this.imagePicker.requestReadPermission().then(()=>this.pickImage())
      }
    })
  }
  
  addJobs(){
    let randName = new Date().getTime().toString()
    this.presentLoader(true)
    if(this.pickedImage ==true){
    const ref = this.uS.uploadImages('JobImages/'+randName);
    const task = ref.putString(this.previewImg,'data_url');
    
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe((myUrl) =>{
          let job={
            companyName : this.company,
            description: this.description,
            postedBy:this.uS.userRef,
            photoUrl:myUrl,
            photoRef:'JobImages/'+randName
          }
          this.uS.addJob(job).then(()=>{
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
  else{
    let job={
      companyName : this.company,
      description: this.description,
      postedBy:this.uS.userRef,
      photoUrl:'',
    }
    this.uS.addJob(job).then(()=>{
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
  }
}
}
