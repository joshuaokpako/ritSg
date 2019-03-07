import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FeedbackPage } from './feedback';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    FeedbackPage,
  ],
  imports: [
    IonicPageModule.forChild(FeedbackPage),
    PipesModule
  ],
  exports: [FeedbackPage]
})
export class FeedBackPageModule {}
