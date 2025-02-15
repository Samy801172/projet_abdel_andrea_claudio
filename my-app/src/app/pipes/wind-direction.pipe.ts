import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'windDirection'
})
export class WindDirectionPipe implements PipeTransform {

  transform(degrees: number): string {
    if (degrees === null || degrees === undefined) return 'Inconnu';

    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }
}
