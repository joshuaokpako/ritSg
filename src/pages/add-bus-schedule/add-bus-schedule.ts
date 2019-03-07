import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ViewController, Platform } from 'ionic-angular';
import { UserserviceProvider } from '../../providers/userservice/userservice';
import { File, FileEntry } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';
import { finalize } from 'rxjs/operators';
import { DocumentPicker } from '@ionic-native/document-picker';
import { FilePath } from '@ionic-native/file-path';



/**
 * Generated class for the AddBusSchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-bus-schedule',
  templateUrl: 'add-bus-schedule.html',
})
export class AddBusSchedulePage {
 header;
 type;
 destination;
 arrival;
 driverName;
 driverNumber;
 departure_1;
 departure_2;
 departure_3;
loading;
  constructor(private filePath: FilePath,private platform:Platform, public docPicker: DocumentPicker, private fileChooser: FileChooser, private file: File, public viewCtrl: ViewController, public uS:UserserviceProvider,public loadingCtrl: LoadingController, public navCtrl: NavController, public navParams: NavParams,public alertCtrl: AlertController) {
    this.header = this.navParams.get('header')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AddBusSchedulePage');
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

  addBus(){
    const loading = this.loadingCtrl.create({
      content: 'Loading...',
      showBackdrop: false
    });
    loading.present();
    let details = {
      destination:this.destination,
      driver:this.driverName,
      arrival: this.arrival,
      driverNumber:this.driverNumber,
      departure_1:this.departure_1
    }
    if(this.departure_2){
      details['departure_2'] = this.departure_2
    }
    if(this.departure_3){
      details['departure_3'] = this.departure_3
    }
    this.uS.addBuses(this.header,details).then((success)=>{
      loading.dismiss()
      this.viewCtrl.dismiss();
    }).catch((error)=>{
      let alert = this.alertCtrl.create({
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
      loading.dismiss()
    })
  }

  uploadPdf(){
    let alert = this.alertCtrl.create({
      subTitle: 'there was an error',
      buttons: ['OK']
      });
    
    let fileChooser;
    if (this.platform.is('ios')) {
      fileChooser = this.docPicker.getFile('pdf')
      
    } else if (this.platform.is('android')) {
      fileChooser = this.fileChooser.open()
    }
    fileChooser
    .then((uri) => { 
      this.filePath.resolveNativePath(uri)       
      .then(filePath => {   
        if(this.platform.is('android')){     
          var type = filePath.substr(filePath.lastIndexOf('.') + 1);
          var correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1); 
          var currentName =filePath.replace(/^.*[\\\/]/, '');   
        }
        else{
          currentName = uri.substr(uri.lastIndexOf('/') + 1);    
          correctPath = uri.substr(0, uri.lastIndexOf('/') + 1); 
        }
          this.makeFileIntoBlob(filePath, currentName,"application/pdf").then((fileblob:any) => {
            let file = fileblob
            if(type == "pdf"){
            this.presentLoader(true)
            const ref = this.uS.uploadImages('Bus Schedules/'+this.header +'/'+this.header+'BusSchedules');
            const task = ref.put(file);
            // get notified when the download URL is available
            task.snapshotChanges().pipe(
              finalize(() => {
                ref.getDownloadURL().subscribe((myUrl) =>{
                  console.log(myUrl)
                  let busSchedule={
                    file:myUrl
                  }
                  this.uS.addBus(this.header,busSchedule).then(()=>{
                    this.presentLoader(false)
                    this.viewCtrl.dismiss();
                    })
                    .catch((error)=>  {
                      this.presentLoader(false)
                      alert = this.alertCtrl.create({
                      subTitle: error.message,
                      buttons: ['OK']
                      });
                    alert.present();
                  })
                })
              })
            ).subscribe()
          }
          else{
            alert = this.alertCtrl.create({
              subTitle: 'The file is not a pdf file. Choose a pdf file',
              buttons: ['OK']
            });
            alert.present();
            this.presentLoader(false)
          }
        }).catch((error)=> {
          alert = this.alertCtrl.create({
            subTitle: error.message,
            buttons: ['OK']
          });
          alert.present();
          this.presentLoader(false)
      })

      }).catch((error)=>  {
        alert = this.alertCtrl.create({
        subTitle: error.message,
        buttons: ['OK']
        });
      alert.present();
      this.presentLoader(false)
    })
    
    }).catch((e) =>{
        alert = this.alertCtrl.create({
        subTitle: e.message ,
        buttons: ['OK']
      });
      alert.present();
      this.presentLoader(false)
    });
  }

  makeFileIntoBlob(imagePath, name, type) {
      return new Promise((resolve, reject) => {
        this.file.resolveLocalFilesystemUrl(imagePath).then((fileEntry:FileEntry) => {
          fileEntry.file((resFile) => {
            var reader = new FileReader()
            reader.readAsArrayBuffer(resFile);
            reader.onloadend = (evt: any) => {
              var imgBlob: any = new Blob([evt.target.result], { type: type });
              imgBlob.name = name;
              resolve(imgBlob)
            };
      
            reader.onerror = (e) => {
              let alert = this.alertCtrl.create({
                subTitle: e.toString(),
                buttons: ['OK']
                });
              alert.present();
              reject(e) 

            };
            
          });
        }, 
        (err) => {
          let alert = this.alertCtrl.create({
            subTitle: err,
            buttons: ['OK']
            });
          alert.present();
        })
      })
  }
  
  

}
