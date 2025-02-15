import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppointmentsService } from '../../../../../services/appointment/appointment.service';
import { ServiceService } from '../../../../../services/Service/service.service';
import { DatePipe, CommonModule } from '@angular/common';
import { AppointmentStatus } from "../../../../../models/Appointment/appointment-types";
import { Appointment } from "../../../../../models/Appointment/appointment.model";
import { NotificationService } from '../../../../../services/notification/notification.service';

// Interface représentant un service
interface Service {
  id: number;
  name: string;
  duration: number;
}

@Component({
  selector: 'app-appointments', // Nom du composant Angular
  templateUrl: './client-appointments.component.html', // Fichier HTML associé
  styleUrls: ['./client-appointments.component.scss'], // Fichier CSS associé
  imports: [ReactiveFormsModule, DatePipe, CommonModule], // Modules Angular nécessaires
  standalone: true, // Permet d'utiliser ce composant indépendamment d'un module
})
export class ClientAppointmentsComponent implements OnInit {
  appointments: Appointment[] = []; // Liste des rendez-vous récupérés depuis l'API
  services: Service[] = []; // Liste des services disponibles
  availableTimeSlots: string[] = []; // Liste des créneaux horaires disponibles

  appointmentForm: FormGroup; // Formulaire pour la prise de rendez-vous
  showAddForm: boolean = false; // Contrôle l'affichage du formulaire
  editingAppointment: Appointment | null = null; // Stocke le rendez-vous en cours d'édition
  minDate: string = new Date().toISOString().split('T')[0]; // Définit la date minimale pour empêcher les dates passées
  clientId: string | null = localStorage.getItem('clientId'); // Récupère l'ID du client connecté

  constructor(
    private fb: FormBuilder, // FormBuilder pour simplifier la gestion des formulaires
    private appointmentService: AppointmentsService, // Service de gestion des rendez-vous
    private serviceService: ServiceService, // Service de gestion des services
    private notificationService: NotificationService, // Service pour les notifications
  ) {
    // Initialisation du formulaire avec des validations
    this.appointmentForm = this.fb.group({
      serviceId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      time: ['', Validators.required],
      note: [''],
    });
  }

  ngOnInit(): void {
    this.loadAppointments(); // Charge les rendez-vous existants
    this.loadServices(); // Charge les services disponibles
  }

  // Ouvre ou ferme le formulaire d'ajout/modification d'un rendez-vous
  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm(); // Réinitialise le formulaire en cas de fermeture
    } else {
      this.generateTimeSlots(); // Génère les créneaux horaires disponibles
    }
  }

  // Charge tous les rendez-vous du client connecté
  loadAppointments(): void {
    const idClient = Number(this.clientId);
    if (isNaN(idClient)) {
      console.error('Client ID invalide :', this.clientId);
      return;
    }

    this.appointmentService.getAll(idClient).subscribe({
      next: (data: Appointment[]) => this.appointments = data, // Stocke les rendez-vous récupérés
      error: (err) => console.error('Erreur lors du chargement des rendez-vous :', err),
    });
  }

  // Charge tous les services disponibles
  loadServices(): void {
    this.serviceService.getAllServices().subscribe((data: Service[]) => {
      this.services = data;
    });
  }

  // Confirmation avant d'annuler un rendez-vous
  confirmCancel(appointment: Appointment): void {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?');

    if (confirmation) {
      this.cancelAppointment(appointment);
    } else {
      console.log('Annulation de rendez-vous annulée.');
    }
  }

  // Annule un rendez-vous en modifiant son statut
  cancelAppointment(appointment: Appointment): void {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: AppointmentStatus.Canceled,
    };

    this.appointmentService.update(appointment.appointmentId!, updatedAppointment).subscribe(() => {
      this.loadAppointments(); // Recharge la liste des rendez-vous après l'annulation
    });
  }

  // Génère les créneaux horaires disponibles
  generateTimeSlots(): void {
    const slots: string[] = [];
    const startHour = 10; // Heure de début : 10h
    const endHour = 16; // Heure de fin : 16h30

    // Générer des créneaux horaires toutes les 30 minutes
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }

    // Exclure les créneaux horaires déjà réservés pour la date sélectionnée
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;

    if (selectedDate) {
      const takenSlots = this.appointments
        .filter((appointment) => appointment.appointmentDate === selectedDate)
        .map((appointment) => appointment.time);

      // Filtrer les créneaux disponibles
      this.availableTimeSlots = slots.filter((slot) => !takenSlots.includes(slot));
    } else {
      this.availableTimeSlots = slots; // Aucun créneau exclu si aucune date n'est sélectionnée
    }
  }

  // Soumission du formulaire pour créer ou mettre à jour un rendez-vous
  submitAppointment(): void {
    if (!this.appointmentForm.valid) return; // Vérifie si le formulaire est valide

    const appointmentData: Appointment = {
      appointmentId: this.editingAppointment?.appointmentId, // Inclut l'ID en cas de mise à jour
      appointmentDate: this.appointmentForm.get('appointmentDate')?.value,
      time: this.appointmentForm.get('time')?.value,
      serviceId: Number(this.appointmentForm.get('serviceId')?.value), // Convertit en nombre
      clientId: Number(localStorage.getItem('clientId')), // Convertit en nombre
      status: 'en attente',
      note: this.appointmentForm.get('note')?.value || '', // Définit une note vide si non renseignée
    };

    console.log('Données envoyées :', appointmentData);

    if (this.editingAppointment) {
      // Mise à jour d'un rendez-vous existant
      this.appointmentService.update(this.editingAppointment.appointmentId!, appointmentData).subscribe({
        next: () => {
          this.loadAppointments();
          this.resetForm();
          this.showAddForm = !this.showAddForm;
          this.notificationService.success('Le rendez-vous a été mis à jour, attendez la confirmation du pharmacien');
        },
        error: (err) => console.error('Erreur lors de la modification du rendez-vous.', err),
      });
    } else {
      // Vérification si l'utilisateur veut créer un autre rendez-vous
      const confirmCreation = window.confirm(
        "Voulez-vous vraiment créer ce rendez-vous à cette date ?"
      );
      // Création d'un autre rendez-vous
      if (confirmCreation) {
        // Création d'un nouveau rendez-vous
        this.appointmentService.create(appointmentData).subscribe({
          next: () => {
            this.loadAppointments();
            this.toggleAddForm();
          },
          error: (err) => console.error('Erreur lors de la création du rendez-vous.', err),
        });
      } else {
        console.log("Création du rendez-vous annulée.");
      }
    }
  }

  // Pré-remplit le formulaire pour modifier un rendez-vous existant
  editAppointment(appointment: Appointment): void {
    this.editingAppointment = appointment;
    this.appointmentForm.patchValue({
      serviceId: appointment.serviceId,
      appointmentDate: appointment.appointmentDate,
      time: appointment.time,
      note: appointment.note,
    });
    this.toggleAddForm();
  }

  // Met à jour les créneaux horaires disponibles lorsqu'une date est sélectionnée
  onDateChange(): void {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    if (selectedDate) {
      this.generateTimeSlots();
    } else {
      this.notificationService.error('Date sélectionnée invalide ou non définie.');
      console.error('Date sélectionnée invalide ou non définie.');
    }
  }

  // Réinitialise le formulaire et annule l'édition
  resetForm(): void {
    this.editingAppointment = null;
    this.appointmentForm.reset();
  }
}
