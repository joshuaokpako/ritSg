import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the FacultyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-faculty',
  templateUrl: 'faculty.html',
})
export class FacultyPage implements OnInit {
public staff:any;
public departments:any;
  constructor(public uS: UserserviceProvider,public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit (){
    this.departments = this.uS.getDepartments()
    this.staff = this.uS.getFaculty();
    this.uS.getFaculty().subscribe(x=>console.log(x))
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FacultyPage');
  }

}
