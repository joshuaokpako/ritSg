import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FacultyPage } from './faculty';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    FacultyPage,
  ],
  imports: [
    IonicPageModule.forChild(FacultyPage),
    PipesModule
  ],
  exports: [FacultyPage]
})
export class FacultyPageModule {}
