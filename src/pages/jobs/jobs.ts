import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { AddJobPage } from '../add-job/add-job';
import { map} from 'rxjs/operators';
import { DetailsPage } from '../details/details';

/**
 * Generated class for the JobsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-jobs',
  templateUrl: 'jobs.html',
})
export class JobsPage implements OnInit {
  public jobs:any;
  public user:any;
  subscription;

  constructor( public uS: UserserviceProvider,public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  this.user="";
  }

  ngOnInit(){
    this.jobs = this.uS.getJob();
    this.subscription = this.uS.user.pipe(map((user:any)=>{
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
       return user    
     })).subscribe(x=>this.user=x )
  }

  ngOnDestroy() { 
    if (this.subscription) {
       this.subscription.unsubscribe();
     }
   
   }

  addJobs(){
    let modal = this.modalCtrl.create(AddJobPage)
    modal.present()
  }

  toDetails(headerName,photo,about,pageType){
    let clubsObj = {
      header: headerName, 
      pic:photo,
      about: about,
      type: pageType
    }
    this.navCtrl.push(DetailsPage,clubsObj)
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad JobsPage');
  }

}
