import { NgModule } from '@angular/core';
import { FilterPipe } from './filter/filter';
import { DocPipe } from './doc/doc';
import { DateFormatPipe } from './date-format/date-format';
import { TimeFilterPipe } from './time-filter/time-filter';
@NgModule({
	declarations: [FilterPipe,
    DocPipe,
    DateFormatPipe,
    TimeFilterPipe],
	imports: [],
	exports: [FilterPipe,
    DocPipe,
    DateFormatPipe,
    TimeFilterPipe]
})
export class PipesModule {}
