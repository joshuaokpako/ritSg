import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileDetailsPage } from './profile-details';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ProfileDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileDetailsPage),
    PipesModule
  ],
})
export class ProfileDetailsPageModule {}
