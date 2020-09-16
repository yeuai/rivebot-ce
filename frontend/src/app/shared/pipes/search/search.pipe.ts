import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'FilterSearch'
})
export class SearchPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (!value) {
      return null;
    }
    if (!args) {
      return value;
    }
    args = args.toLowerCase();
    return value.filter(function(item) {
      return JSON.stringify(item.tieu_de_bao_cao).toLowerCase().includes(args);
    });
  }
}
