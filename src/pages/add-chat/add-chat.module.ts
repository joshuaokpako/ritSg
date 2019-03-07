import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddChatPage } from './add-chat';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    AddChatPage,
  ],
  imports: [
    IonicPageModule.forChild(AddChatPage),
    PipesModule
  ],
  exports: [AddChatPage]
})
export class AddChatPageModule {}
