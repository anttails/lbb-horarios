import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trainTypeCheck',
  standalone: true
})
export class TrainTypeCheckPipe implements PipeTransform {

  transform(value: number, index: number): boolean {
    return !!(value & Math.pow(2,index));
  }

}
