import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { map, takeUntil} from 'rxjs/operators';
import { File } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Subject } from 'rxjs';

/**
 * Generated class for the BusSchedulesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-bus-schedules',
  templateUrl: 'bus-schedules.html',
})
export class BusSchedulesPage implements OnInit {
header;
progress;
buses;
pdfBus;
observer:Subject<any> = new Subject();
show:boolean = true;
subscription;
public user;
  constructor(public uS:UserserviceProvider, public navCtrl: NavController, public navParams: NavParams,private fileOpener: FileOpener, private file: File, private transfer: FileTransfer, private platform: Platform) {
   this.header = navParams.get('header')
  }

  ngOnInit() {
    this.subscription = this.uS.user.pipe(map((user:any)=>{
       return user    
     })).subscribe(x=>this.user=x )
    this.buses = this.uS.getBuses(this.header)
    this.observer = new Subject()
   
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  addBus(header){ 
      let obj ={
        header:header
      }
      this.navCtrl.push('AddBusSchedulePage', obj)
  }

  ngOnDestroy(){
    this.observer.next()
    this.observer.complete()
  }

  downloadAndOpenPdf() {
    this.progress = 1
    this.show = false
   
    let path = null;
 
    if (this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is('android')) {
      path = this.file.externalDataDirectory;
    }
 console.log(path)
    const transfer = this.transfer.create();
    
  this.pdfBus =  this.uS.getBus(this.header).pipe(takeUntil(this.observer)).subscribe((x:any)=>{
    transfer.download(x.file, path + 'BusScheduleAthletics.pdf').then(entry => {
      transfer.onProgress((listener)=>{
        while (this.progress <= 100) {
          this.progress = (Math.ceil((listener.loaded / listener.total)*100).toString()) + '%';
          document.getElementById('progressBar').style.width = this.progress
        }
    })
    let url = entry.toURL();
    this.fileOpener.open(url, 'application/pdf')
      .then(() => {
        this.show = true
      })
      .catch(e => this.show = true);
    })
  })
    
      

  }


}
