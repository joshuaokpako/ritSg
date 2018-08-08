import { NgModule } from '@angular/core';
import { FilterPipe } from './filter/filter';
import { DocPipe } from './doc/doc';
@NgModule({
	declarations: [FilterPipe,
    DocPipe],
	imports: [],
	exports: [FilterPipe,
    DocPipe]
})
export class PipesModule {}
