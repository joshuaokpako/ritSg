import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BooksPage } from './books';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    BooksPage,
  ],
  imports: [
    IonicPageModule.forChild(BooksPage),
    PipesModule
  ],
})
export class BooksPageModule {}
