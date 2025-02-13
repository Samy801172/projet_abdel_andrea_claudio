import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Manufacturing } from '../../models/manufacturing/manufacturing.model';

@Injectable({
  providedIn: 'root'
})
export class ManufacturingNotificationService {
  private manufacturingUpdateSource = new Subject<Manufacturing>();
  manufacturingUpdate$ = this.manufacturingUpdateSource.asObservable();

  notifyManufacturingUpdate(manufacturing: Manufacturing) {
    this.manufacturingUpdateSource.next(manufacturing);
  }
} 