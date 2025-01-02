
// components/booking/booking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {Service} from '../../models/Service/service.model';
import {NotificationService} from '../../services/notification/notification.service';
import {AppointmentsService} from '../../services/appointment/appointment.service';


@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  currentStep = 1;
  services: Service[] = [];
  selectedService?: Service;
  availableSlots: string[] = [];
  selectedTime?: string;
  bookingForm: FormGroup;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentsService,
    private notificationService: NotificationService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.initForm();
  }

  ngOnInit(): void {
    this.loadServices();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required]
    });
  }

  private loadServices(): void {
    this.appointmentService.getServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        this.notificationService.error('Erreur lors du chargement des services');
      }
    });
  }

  selectService(service: Service): void {
    this.selectedService = service;
  }

  onDateChange(): void {
    if (!this.selectedService) return;

    const selectedDate = this.bookingForm.get('date')?.value;
    this.appointmentService.getAvailableSlots(selectedDate, this.selectedService.id)
      .subscribe({
        next: (slots) => {
          this.availableSlots = slots;
          if (slots.length === 0) {
            this.notificationService.info('Aucun créneau disponible pour cette date');
          }
        },
        error: (error) => {
          this.notificationService.error('Erreur lors du chargement des créneaux');
        }
      });
  }

  selectTimeSlot(time: string): void {
    this.selectedTime = time;
    this.bookingForm.patchValue({ time });
  }

  confirmBooking(): void {
    if (!this.selectedService || !this.selectedTime) return;

    const bookingData = {
      serviceId: this.selectedService.id,
      date: this.bookingForm.get('date')?.value,
      time: this.selectedTime
    };

    this.appointmentService.createAppointment(bookingData).subscribe({
      next: () => {
        this.notificationService.success('Rendez-vous confirmé avec succès !');
        this.currentStep = 3;
      },
      error: () => {
        this.notificationService.error('Erreur lors de la création du rendez-vous');
      }
    });
  }

  nextStep(): void {
    this.currentStep++;
  }

  previousStep(): void {
    this.currentStep--;
  }
}
