import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams,ModalController } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';

/**
 * Generated class for the BooksPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-books',
  templateUrl: 'books.html',
})
export class BooksPage implements OnInit {
books;
  constructor(public uS:UserserviceProvider,public navCtrl: NavController, public navParams: NavParams,public modalCtrl: ModalController) {
  }

  ngOnInit(){
    this.books= this.uS.getBooks()
  }
  ionViewDidLoad() {
    
  }

  addBookModal(header){
    let addObj ={
      header:  header
    }
    let modal = this.modalCtrl.create('AddBooksPage', addObj)
    modal.present()
  }
  

}
