import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PlannerModalPage } from './planner-modal';

@NgModule({
  declarations: [
    PlannerModalPage,
  ],
  imports: [
    IonicPageModule.forChild(PlannerModalPage),
  ],
})
export class PlannerModalPageModule {}
