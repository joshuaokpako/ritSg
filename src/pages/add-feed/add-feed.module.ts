import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddFeedPage } from './add-feed';

@NgModule({
  declarations: [
    AddFeedPage,
  ],
  imports: [
    IonicPageModule.forChild(AddFeedPage),
  ],
})
export class AddFeedPageModule {}
