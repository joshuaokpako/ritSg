import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController } from 'ionic-angular';
import { DetailsPage } from '../details/details';
import { map, flatMap, filter } from 'rxjs/operators';
import { AddpagePage } from '../addpage/addpage';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the RitAthleticsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-rit-athletics',
  templateUrl: 'rit-athletics.html',
  providers: [UserserviceProvider]
})
export class RitAthleticsPage implements OnInit {
  public athletics:any;
  public user;
  subscription;

  constructor(public uS:UserserviceProvider,public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController) {
    this.user= "";
    this.athletics = this.uS.athletics
  }

  
  ngOnInit(){
    this.subscription = this.uS.user.pipe(map((user:any)=>{
      return user     
    })).subscribe(x=>this.user=x )


  }

  ngOnDestroy() { 
   if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ionViewDidLoad() {
   
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
  addEventModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddpagePage,addObj)
    modal.present()
  }
}
