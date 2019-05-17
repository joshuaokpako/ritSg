import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, AlertController, App, LoadingController, ToastController, IonicPage, Events, ActionSheetController, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { finalize, map, takeUntil } from 'rxjs/operators';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import * as moment from 'moment';
import { Subject } from 'rxjs';


/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [UserserviceProvider]
})
export class ProfilePage implements OnInit {
  public user:any;
  public previewImg:any;
  public loading:any;
  observer:Subject<any> = new Subject();
  public userSpirit;
  subscription
  staff
  canLeave = true;
  constructor(private barcodeScanner: BarcodeScanner,private spinnerDialog: SpinnerDialog,
    private iab: InAppBrowser,public loadingCtrl: LoadingController, 
    public actionSheetCtrl: ActionSheetController, public events:Events, 
    public usersService : UserserviceProvider, public navCtrl: NavController, 
    public navParams: NavParams, public alertCtrl:AlertController,
    public toastCtrl:ToastController,public app:App, public camera: Camera,
    public platform: Platform) {
  }

  ionViewCanLeave(){
    return this.canLeave
  }
  ngOnInit(){
    this.usersService.getPersonalEvents()
    this.subscription = this.usersService.user.pipe(map((user:any)=>{
      if (user.groupAdmin){
         user.groupAdmin.forEach(element => {
           switch (element) {
             case "SG":
               user.SG=true
               break;
             default:
               console.log("didn't work")
               break;
             }
         });
         
       }
       if(user.office){
         this.staff = true
       }
       return user    
     })).subscribe(x=>this.user=x )
   
  }

  signOut(){
    let observer = new Subject();
    this.observer = observer;
    let n = 0;
    this.usersService.db.colWithIds$("devices", ref => ref.where('userId', '==',this.usersService.uid)).pipe(takeUntil(this.observer),
      map((tokens:any)=>{
        n = n+1;
        if(n===1){
          this.observer.next()
          this.observer.complete()
        }
        if (tokens.length!= 0){
        tokens.forEach(token=> {
        this.usersService.db.delete("devices/"+token.id)
        })
          this.usersService.signOut()
          .then(()=>{
            this.events.publish('loggedIn','loggedOut')
            this.app.getRootNav().setRoot('CoverPage')
        })
        }
        else{
          this.usersService.signOut().then(()=>{
            this.app.getRootNav().setRoot('CoverPage')
          }).catch((error) => {
            this.app.getRootNav().setRoot('CoverPage')
          });
          }
        
      })
    ).subscribe()
  }

  showMore() {
    let  office = {
      text: 'Change Profile Picture',
      handler: () => {
        this.presentConfirm()
      }
    }
    if(this.staff){
      office = {
        text: 'Change Office Room Number',
        handler: () => {
          this.changeOffice()
        }
      }
    }
    
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Change Password',
          handler: () => {
            this.presentAlertPassword()
          }
        },
        office,
        {
          text: 'Contact Developer',
          role: 'destructive',
          handler: () => {
            this.openBrowser('https://ritdsgwordpresscom.wordpress.com/contact/')
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }

  openBrowser(link){
    const browser = this.iab.create(link,'_blank', 'location=yes,hideurlbar=yes,hidespinner=yes,toolbarcolor=#F36E21');
    browser.on('loadstart').subscribe(event => {
      this.spinnerDialog.show();
   });
    browser.on('loadstop').subscribe(event => {
    this.spinnerDialog.hide();
    });
    browser.on('loaderror').subscribe(event => {
      this.spinnerDialog.hide();
    });
    
    browser.show()
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
            this.usersService.updateProfileName(data)
          }
        }
      ]
    });
    prompt.present();
  }

  changeOffice(){
    const prompt = this.alertCtrl.create({
      title: 'Edit Office Room Number',
      message: "Enter your new office number",
      inputs: [
        {
          name: 'office',
          placeholder: 'Room Number'
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
            this.usersService.updateOffice(data)
          }
        }
      ]
    });
    prompt.present();
  }

  openEditAlertDesc(){
    const prompt = this.alertCtrl.create({
      title: 'Edit description',
      message: "Enter your new description",
      inputs: [
        {
          name: 'description',
          placeholder: 'Describe your club'
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
            this.usersService.updateDesc(data)
          }
        }
      ]
    });
    prompt.present();
  }

  presentAlertPassword(){
    let alert = this.alertCtrl.create({
      title: 'Change Password',
      message: "Change your Password",
      inputs: [
        {
          name: 'oldPassword',
          placeholder: 'Current Password',
          type: 'password'
        },
        {
          name: 'newPassword',
          placeholder: 'New Password',
          type: 'password'
        }
      ],
      buttons: [
          {
          text: 'Change Password',
          handler: (data) => {
            this.verifyPassword(data.oldPassword,data.newPassword) 
          }
        }
      ]
    })
    alert.present()
  }

  verifyPassword(old,newpass){
    this.usersService.reauthenticateUser(old,newpass).then(()=>{
      let alert = this.alertCtrl.create({
        subTitle: 'Password Succesfully changed',
      })
      alert.present()
    }).catch((error)=>{
      let alert = this.alertCtrl.create({
        subTitle: error,
      })
      alert.present()
    })
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
  presentOptions() {
    let alert = this.alertCtrl.create({
      title: 'Scan Barcode',
      buttons: [
        {
          text: 'Attended Spirit Event (15)',
          handler: () => {
            this.scanBarcode('Attended Event') 
          }
        },
        {
          text: 'Wore RIT Merchandise (5)',
          handler: () => {
            this.scanBarcode('Wore RIT')
          }
        },
        {
          text: 'Represented RIT (30)',
          handler: () => {
            this.scanBarcode('Represented RIT')
          }
        },
        {
          text: 'Posted on Instagram (5)',
          handler: () => {
            this.scanBarcode('Instagram')
          }
        },
        {
          text: 'Attend Athletics Event off Campus (15)',
          handler: () => {
            this.scanBarcode('Attend Athletics')
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
      this.loading.present();
    }
    else{
      this.loading.dismiss();
    }

  }


  onBackKeyDown(){
    return false
  }

  scanBarcode(header){
    this.events.publish('barcode', 'scanning')
    let message;
    let observer = new Subject()
    let test = false
    let worked; // show alert depending on if scan failed or worked
    let sub; // subscription
    let subs;
    let toastCss; // css for toast
    this.barcodeScanner.scan({resultDisplayDuration:0,showTorchButton:true}).then(barcodeData => {
     let data = this.usersService.encrypt(barcodeData.text)
     if(!barcodeData.cancelled){
        sub = this.usersService.checkStudentId(data).pipe(takeUntil(observer)).subscribe((student:any)=>{
          if (test === false){
            if(student.length!=0){
              test = true
              switch (header) {
                case 'Attended Event':
                  if(student[0][header]){
                    if(moment().diff(moment.unix(student[0][header].seconds), 'hours') >= 1){
                      worked = true
                      this.usersService.updateSpiritPoints(header,student[0].id,15)
                    }
                  }
                  else{
                    worked =true
                    this.usersService.updateSpiritPoints(header,student[0].id,15)
                  } 
                  break;
                case 'Wore RIT':
                  if(student[0][header]){
                    if(moment().diff(moment.unix(student[0][header].seconds), 'hours') >= 1){
                      console.log(header)
                      worked = true
                      this.usersService.updateSpiritPoints(header,student[0].id,5)
                      
                    }
                  }
                  else{
                    worked = true
                    this.usersService.updateSpiritPoints(header,student[0].id,5)
                  }
                  break;
                case 'Represented RIT':
                  if(student[0][header]){
                    if(moment().diff(moment.unix(student[0][header].seconds), 'hours') >= 1){
                      console.log(header)
                      worked = true
                      this.usersService.updateSpiritPoints(header,student[0].id,30)
                    
                    }
                  }
                  else{
                    worked = true
                    this.usersService.updateSpiritPoints(header,student[0].id,30)
                  }
                  break;
                case 'Instagram':
                  if(student[0][header]){
                    console.log(header)
                    if(moment().diff(moment.unix(student[0][header].seconds), 'hours') >= 1){
                      worked = true
                       this.usersService.updateSpiritPoints(header,student[0].id,5)
                    }
                  }
                  else{
                    worked = true
                    this.usersService.updateSpiritPoints(header,student[0].id,5)
                  }
                  break;     
                  case 'Attend Athletics':
                  if(student[0][header]){
                    if(moment().diff(moment.unix(student[0][header].seconds), 'hours') >= 1){
                      console.log(header)
                      worked = true
                       this.usersService.updateSpiritPoints(header,student[0].id,15)
                       
                    }
                  }
                  else{
                    worked = true
                     this.usersService.updateSpiritPoints(header,student[0].id,15)
                     observer.next()
                     observer.complete()
                  }
                  break;     
                default:
                  break;
              }
            message = worked===true?"Scan Successful": "This User has been scanned in the past 1 hour"
            toastCss = worked===true?"successToast": "failedToast"
            observer.next()
            observer.complete()
            }
            else{
              message = "This User does not exist or has not verified their id"
              toastCss = "failedToast"
              observer.next()
              observer.complete()
            }
          const toast = this.toastCtrl.create({
            message: message,
            duration: 5000,
            position: "top",
            cssClass: toastCss
          });
          toast.present();
        }

       })
      }
      else if (barcodeData.cancelled){
        setTimeout(()=>{
          this.events.publish('barcode', 'notScanning')
        }, 1000)
      }
    })
    .catch(err => {
      this.events.publish('barcode', 'notScanning')
    })
      
  }
  
ngOnDestroy(){
  this.observer.next()
  this.observer.complete()
}

updateProfilePic(){
  this.presentLoader(true)
    let randName =new Date().getTime().toString()
    const ref = this.usersService.uploadImages('profilePics/'+this.usersService.userName+'/'+this.usersService.uid+'/'+'profilePic');
    const task = ref.putString(this.previewImg,'data_url');
    // get notified when the download URL is available
    task.snapshotChanges().pipe(takeUntil(this.observer),
      finalize(() => {
        ref.getDownloadURL().pipe(takeUntil(this.observer)).subscribe((myUrl) =>{
          let pic={
            photoUrl:myUrl
          }
          this.usersService.updateProfilePic(pic).then((success)=>{
            this.presentLoader(false)
          }).catch((error)=>{
            this.presentLoader(false)
          })
        })
      })
    ).subscribe()
}


  

  toProfileDetailsPage(header){
    let detailsObj={
      header :header
    }
    this.navCtrl.push('ProfileDetailsPage', detailsObj)
  }
  toMyBooks(header){
    let detailsObj={
      header :header
    }
    this.navCtrl.push('BooksPage', detailsObj)
  }
}
