import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JobsPage } from './jobs';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    JobsPage,
  ],
  imports: [
    IonicPageModule.forChild(JobsPage),
    PipesModule
  ],
})
export class JobsPageModule {}
