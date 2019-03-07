import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewMembersPage } from './view-members';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    ViewMembersPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewMembersPage),
    PipesModule
  ],
})
export class ViewMembersPageModule {}
