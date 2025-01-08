// src/app/components/Promotion/promotion-timer.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotion-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-container">
      <!-- Badge -20% -->
      <div class="discount-badge">-20%</div>
      <!-- Timer -->
      <div class="time-units">
        <div class="time-unit">
          <span class="number">{{days}}</span>
          <span class="label">jours</span>
        </div>
        <div class="separator">|</div>
        <div class="time-unit">
          <span class="number">{{hours}}</span>
          <span class="label">heures</span>
        </div>
        <div class="separator">|</div>
        <div class="time-unit">
          <span class="number">{{minutes}}</span>
          <span class="label">min</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timer-container {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      position: relative;
      gap: 0.5rem;
      min-width: 250px;
    }

    .discount-badge {
      background: #fbbf24;
      color: black;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.875rem;
    }

    .time-units {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-left: 0.5rem;
    }

    .time-unit {
      display: flex;
      flex-direction: row;
      align-items: baseline;
      gap: 0.25rem;
    }

    .number {
      font-size: 1rem;
      font-weight: bold;
    }

    .label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .separator {
      color: rgba(255, 255, 255, 0.7);
      font-weight: 200;
      margin: 0 -0.25rem;
    }
  `]
})
export class PromotionTimerComponent {
  @Input() endDate!: Date | string;
  days: number = 362;
  hours: number = 4;
  minutes: number = 6;
}
