import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FeedsPage } from './feeds';
import { PipesModule } from './../../pipes/pipes.module';

@NgModule({
  declarations: [
    FeedsPage,
  ],
  imports: [
    IonicPageModule.forChild(FeedsPage),
    PipesModule
  ],
})
export class FeedsPageModule {}
