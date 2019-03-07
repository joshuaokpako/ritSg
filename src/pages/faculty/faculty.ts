import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, IonicPage, Keyboard } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the FacultyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-faculty',
  templateUrl: 'faculty.html',
})
export class FacultyPage implements OnInit {
public staff:any;
public departments:any;
tabBarElement;
  constructor(public uS: UserserviceProvider,public keyboard:Keyboard, public navCtrl: NavController, public navParams: NavParams) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ngOnInit (){
    this.departments = this.uS.getDepartments()
    this.staff = this.uS.getFaculty();
  }

  ionViewWillEnter() {
    this.tabBarElement.style.display = 'none';
  }

  ionViewWillLeave() {
    this.tabBarElement.style.display = 'flex';
  }

}
