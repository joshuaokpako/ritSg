import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, LoadingController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { CoverPage } from '../cover/cover';
import { BooksPage } from '../books/books';
import { ProfileDetailsPage } from '../profile-details/profile-details';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { finalize } from 'rxjs/operators';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [UserserviceProvider]
})
export class ProfilePage implements OnInit {
  public user:any;
  public previewImg:any;
  public loading:any;

  constructor(public loadingCtrl: LoadingController,public usersService : UserserviceProvider, public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController,public app:App, public camera: Camera) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  ngOnInit(){
    this.usersService.getPersonalEvents()
    this.usersService.fireAuth.authState.subscribe(user => {
      if (user) {
        this.user = user
      }
      else{
        this.signOut()
      }
    })
   
  }


  signOut(){
    this.usersService.signOut().then(()=>{
      console.log("yes it did")
      this.app.getRootNav().setRoot(CoverPage)
    }).catch((error) => {
      // An error happened.
    });
  }
  
  openEditAlert(){
    const prompt = this.alertCtrl.create({
      title: 'Edit Fullname',
      message: "Enter your new display name",
      inputs: [
        {
          name: 'fullName',
          placeholder: 'Your Fullname'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Change',
          handler: data => {
            console.log(data)
            this.usersService.updateProfileName(data)
          }
        }
      ]
    });
    prompt.present();
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
        this.updateProfilePic()
          
      }, 
      (err) => 
      {
          console.log(err);
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
      this.updateProfilePic()
    }, 
    (err) => 
    {
        console.log(err);
    }); 
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
  
  updateProfilePic(){
    this.presentLoader(true)
      let randName =new Date().getTime().toString()
      const ref = this.usersService.uploadImages('profilePics/'+this.usersService.userName+'/'+this.usersService.uid+'/'+'profilePic');
      const task = ref.putString(this.previewImg,'data_url');
      // get notified when the download URL is available
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe((myUrl) =>{
            let pic={
              photoUrl:myUrl
            }
            this.usersService.updateProfilePic(pic).then((success)=>{
              this.presentLoader(false)
            })
          })
        })
      ).subscribe()
  }
  

  toMyFeeds(header){
    let detailsObj={
      header :header
    }
    this.navCtrl.push(ProfileDetailsPage, detailsObj)
  }

  toMyEvents(header){
    let detailsObj={
      header :header
    }
    this.navCtrl.push(ProfileDetailsPage, detailsObj)
  }
  toMyBooks(header){
    let detailsObj={
      header :header
    }
    this.navCtrl.push(BooksPage, detailsObj)
  }
}
