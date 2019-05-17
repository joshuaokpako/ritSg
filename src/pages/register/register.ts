import { Component} from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, App, Events, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { FcmProvider } from '../../providers/fcm/fcm';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SpinnerDialog } from '@ionic-native/spinner-dialog';
import { InAppBrowser } from '@ionic-native/in-app-browser';


/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */



@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
  providers: [UserserviceProvider]
})
export class RegisterPage {
  public studentId: string ='';
  public email: string;
  public password: string;
  public name:string;
  public type:any;
  public staff:string;
  public office:string;
  public departments:any;
  public faculty:any = "";
  public preventBack;
  public position:any = "";
  test:boolean = false; // if student ID has not been used return true else false
  observer:Subject<any> = new Subject();
  canLeave = true;


  constructor(private barcodeScanner: BarcodeScanner,public fcm:FcmProvider,public events:Events, 
    public usersService : UserserviceProvider,public loadingCtrl: LoadingController, 
    public alertCtrl: AlertController,  public navCtrl: NavController, 
    public navParams: NavParams, public app : App, 
    private spinnerDialog: SpinnerDialog,private iab: InAppBrowser,public platform: Platform) {
      this.type ="student"
  }

  ionViewCanLeave(){
    return this.canLeave
  }

  ionViewDidLoad() {
    this.getDepartment()
  }
  ionViewWillLeave(){
    this.observer.next()
    this.observer.complete()
  }

toPrivacyPolicy(link){
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

  getDepartment(){
    this.departments = this.usersService.getDepartments()
  }

  compareFn(e1, e2): boolean {
    return e1 && e2 ? e1.id === e2.id : e1 === e2;
  }
  signUpUser(data){
    
  }
  submitLogin(){
    if(this.studentId.length<10){
     let len = 10 - this.studentId.length
     for (let index = 0; index <len; index++) {
       this.studentId = this.studentId + '0'
     }
    }
    var loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    loader.present();
    let test = false
    let data =this.usersService.encrypt(this.studentId)
    this.usersService.checkStudentId(data).pipe(takeUntil(this.observer)).subscribe((student:any)=>{
      if(student.length===0){
        if(test ===false){
          var   account = {
            fullName: this.name.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' '),
            email: this.email.trim().replace(/\s+/g, "").toLowerCase(),
            admin: "none",
            type: this.type,
          };
          if(this.type=="staff"){
            account["staff"] = true;
            account["faculty"] = this.faculty;
            account["position"] = this.position;
            account["office"] = this.office;
            account["spiritPoints"]= -1;
          }
          else{
            account["staff"] = false;
            account["spiritPoints"]= 0;
            account["studentId"]= data;
          }
          let url = "https://firebasestorage.googleapis.com/v0/b/rit-sg.appspot.com/o/profilePics%2Fblank-profile-picture.png?alt=media&token=99cf5b81-e1de-4778-912f-885e860142f8"
          account['photoUrl'] = url;
        
          let ritemailend = this.email.trim().replace(/\s+/g, "").slice(-8);//get the last 8 char of email
      
          //check if its an rit email ending with @rit.edu
          if(ritemailend!="@rit.edu"){
            loader.dismiss();
            let alert = this.alertCtrl.create({
              subTitle: 'email must be an rit email ending with @rit.edu',
              buttons: ['OK']
            });
            alert.present();
            this.password = ""//empty the password field
          }
          
          else{
            if(this.email.trim().replace(/\s+/g, "").length > 8){
              var that = this;
              this.usersService.signUpUserService(account,this.password).then(authData => {
                //successful
                this.fcm.getToken()
                this.events.publish('loggedIn', 'logged in')
                  loader.dismiss();
              },
              error => {
                loader.dismiss();
                // Unable to log in
                let alert = this.alertCtrl.create({
                  subTitle: error,
                  buttons: ['OK']
                });
                alert.present();
                that.password = ""//empty the password field
              }).catch(error=>{
                loader.dismiss();
                // Unable to log in
                let alert = this.alertCtrl.create({
                  subTitle: error,
                  buttons: ['OK']
                });
                alert.present();
                that.password = ""//empty the password field
              })
            }
            else{
              let alert = this.alertCtrl.create({
                subTitle: 'email is invalid',
                buttons: ['OK']
              });
              alert.present();
              this.password = ""//empty the password field
            }
          }
          this.test = true
        }
      }
      else{
        loader.dismiss();
        let alert = this.alertCtrl.create({
          subTitle: 'This student ID has already been used',
          buttons: ['OK']
        });
        alert.present();
        this.password = ""//empty the password field
        this.studentId =""
      }
    })
    
    
  }

  scan(){
    this.barcodeScanner.scan({resultDisplayDuration:0,showTorchButton:true}).then(barcodeData => {
      let data = this.usersService.encrypt(barcodeData.text)
      if(!barcodeData.cancelled){
        this.usersService.checkStudentId(data).pipe(takeUntil(this.observer)).subscribe((student:any)=>{
          if(student.length===0){
            this.studentId = barcodeData.text
          }
          else{
            let alert = this.alertCtrl.create({
              subTitle: 'This student ID has already been used',
              buttons: ['OK']
            });
            alert.present();
            this.password = ""//empty the password field
          }
        })
      }
      else if (barcodeData.cancelled){
        this.canLeave = false
        setTimeout(()=>{
          this.canLeave = true
          }, 1000)
      }
    })
    .catch(err => {
      this.canLeave = true;
    })
  }
}

