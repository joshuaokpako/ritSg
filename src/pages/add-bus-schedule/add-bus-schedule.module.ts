import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddBusSchedulePage } from './add-bus-schedule';

@NgModule({
  declarations: [
    AddBusSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(AddBusSchedulePage),
  ],
})
export class AddBusSchedulePageModule {}
