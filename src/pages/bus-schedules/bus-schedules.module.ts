import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BusSchedulesPage } from './bus-schedules';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    BusSchedulesPage,
  ],
  imports: [
    IonicPageModule.forChild(BusSchedulesPage),
    PipesModule
  ],
})
export class BusSchedulesPageModule {}
