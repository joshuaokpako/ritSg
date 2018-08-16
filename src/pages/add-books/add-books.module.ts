import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddBooksPage } from './add-books';

@NgModule({
  declarations: [
    AddBooksPage,
  ],
  imports: [
    IonicPageModule.forChild(AddBooksPage),
  ],
})
export class AddBooksPageModule {}
