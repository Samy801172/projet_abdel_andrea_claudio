// components/shared/notification/notification.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationMessage, NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})

export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications().subscribe(
      notification => {
        this.addNotification(notification);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private addNotification(notification: NotificationMessage): void {
    this.notifications.push(notification);
    if (notification.duration !== undefined) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, notification.duration);
    } else {
      // Ajoutez une durée par défaut pour toutes les notifications (par exemple, 3 secondes)
      setTimeout(() => {
        this.removeNotification(notification);
      }, 3000);
    }
  }

  removeNotification(notification: NotificationMessage): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  trackById(index: number, item: NotificationMessage): string {
    return item.message;
  }
}
