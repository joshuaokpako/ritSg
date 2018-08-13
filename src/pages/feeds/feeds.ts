import { Component, OnInit } from '@angular/core';
import { NavController,ModalController } from 'ionic-angular';
import { AddFeedPage } from '../add-feed/add-feed';
import { UserserviceProvider } from '../../providers/userservice/userservice';

@Component({
  selector: 'page-feeds',
  templateUrl: 'feeds.html'
})
export class FeedsPage implements OnInit {
  eventHeaderName:string ="Feeds";
  public feeds:any;

  constructor(public uS:UserserviceProvider, public navCtrl: NavController,public modalCtrl: ModalController,) {

  }

  ngOnInit(){
    this.feeds = this.uS.getFeed();
  }
  addFeedModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create(AddFeedPage, addObj)
    modal.present()
  }

}
