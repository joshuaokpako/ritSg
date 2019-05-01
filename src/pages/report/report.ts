import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController, ViewController, LoadingController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the AddJobPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'report',
  templateUrl: 'report.html',
})
export class ReportPage {


  public description = "";
  public loading:any;
  public personEmail;
  reporting = '';
  personName;
  personId;
  constructor(public uS : UserserviceProvider,public navCtrl: NavController,public loadingCtrl: LoadingController, public alertCtrl: AlertController, 
   public navParams: NavParams,public viewCtrl: ViewController) {
    this.personEmail = this.navParams.get('reportEmail');
    this.personName = this.navParams.get('reportName');
    this.personId = this.navParams.get('reportId');
   }
  ionViewDidLoad() {
    console.log('ionViewDidLoad AddJobPage');
    this.reporting = this.personName.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ') + ' ('+ this.personEmail +')'
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


  
  
  report(){
    this.presentLoader(true)
    
          let report={
            reportedName : this.personName,
            reportedId: this.personId,
            reportedEmail: this.personEmail,
            description: this.description,
            reportedBy:this.uS.userRef,
            reportedById: this.uS.uid,
            reportedByName: this.uS.userName,
            reportedByEmail: this.uS.userEmail
          }
          this.uS.addReport(report).then(()=>{
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
