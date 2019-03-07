import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddBooksPage } from './add-books';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    AddBooksPage,
  ],
  imports: [
    IonicPageModule.forChild(AddBooksPage),
    PipesModule
  ],
})
export class AddBooksPageModule {}
