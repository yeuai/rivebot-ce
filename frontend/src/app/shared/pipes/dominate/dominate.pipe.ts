import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'dominate'
})
export class DominatePipe implements PipeTransform {
  transform(modulo: number): any {
    const now = new Date();
    return (now.getDate() + now.getMonth()) % modulo;
  }
}
