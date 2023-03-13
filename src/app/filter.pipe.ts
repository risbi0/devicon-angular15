import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(icons: any[], search: string): any[] {
    if (!icons || !search) {
      return icons;
    }
    return icons.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }
}
