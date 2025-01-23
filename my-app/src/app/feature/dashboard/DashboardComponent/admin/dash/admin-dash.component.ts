import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { ClientService } from '../../../../../services';
import { AppointmentsService } from '../../../../../services/appointment/appointment.service';
import { OrderService } from '../../../../../services';
import { PublicService } from '../../../../../services/pubic/public.service';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dash',
  templateUrl: './admin-dash.component.html',
  standalone: true,
  imports: [
    NgClass,
    DatePipe,
    CommonModule
  ],
  styleUrl: './admin-dash.component.scss'
})
export class AdminDashComponent implements OnInit {
  title: string = 'Tableau de bord'; // Titre
  stats: any[] = []; // Statistiques rapides
  recentMessages: any[] = []; // Messages récents
  pendingTasks: any[] = []; // Tâches en attente
  pendingAppointments: number = 0; // Nombre de rendez-vous en attente
  orderTotal: number = 0; // Nombre de commande total
  currentTime: string = ''; // Heure actuelle
  isLoading: boolean = true; // Indicateur de chargement

  credential: string | null = localStorage.getItem("clientId");
  client: any;
  editForm: any = {}; // Initialisation de l'objet utilisé pour l'édition

  constructor(private clientService: ClientService,
              private appointmentsService: AppointmentsService,
              private orderService: OrderService,
              private notificationService: NotificationService,
              private publicService: PublicService) { }

  ngOnInit(): void {
    this.loadDashboardData(); // Charger les données du tableau de bord
    this.updateCurrentTime(); // Mettre à jour l'heure actuelle
    this.loadNickname(); // charge les données de l'admin
    this.LoadAppointmentsNotConfirmed(); // charge le nombre de rendez vous non confirmé
    this.loadOrderCount(); // Charge le nombre de commande totale
  }

  // Charge le nombre de commande
  loadOrderCount(): void {
    this.publicService.orderCount().subscribe({
      next: (count: number) => {
        console.log('Nombre total de commandes:', count);
        this.orderTotal = count; // Stocke le résultat pour l'afficher
        console.log(this.orderTotal)
      },
      error: (error) => {
        console.error('Erreur lors du chargement du nombre total de commandes:', error);
      },
    });
  }

  // Charge le nombre de rendez-vous non confirmés
  LoadAppointmentsNotConfirmed(): void {
    this.publicService.appointmentsCount().subscribe({
      next: (count: number) => {
        console.log('Nombre total de rendez vous non confirmé:', count);
        this.pendingAppointments = count;
        console.log(this.pendingAppointments)
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous en attente :', error);
      },
    });
  }

  // Charger le profil du client
  loadNickname(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      return;
    }
    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        this.client = data;
        this.editForm = { ...this.client }; // Copie les données du client dans editForm
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
      },
    });
  }

  // Charger les données du tableau de bord
  loadDashboardData(): void {
    this.isLoading = true;

    // Simuler le chargement des données
    setTimeout(() => {
      this.stats = [
        { label: 'Utilisateurs', value: 100 },
        { label: 'Produits', value: 50 },
        { label: 'Commandes', value: 30 },
        { label: 'Revenus', value: '€ 5,000' }
      ];

      this.recentMessages = [
        { content: 'Nouvelle commande reçue !', timestamp: new Date() },
        { content: 'Le client John Doe a envoyé un message.', timestamp: new Date() },
        { content: 'Mise à jour des stocks effectuée.', timestamp: new Date() }
      ];

      this.pendingTasks = [
        { description: 'Vérifier les paiements en attente', priority: 'high' },
        { description: 'Mettre à jour les produits en rupture', priority: 'low' },
        { description: 'Envoyer les rappels pour les rendez-vous', priority: 'medium' }
      ];

      this.isLoading = false; // Fin du chargement
    }, 2000);
  }

  // Mise à jour de l'heure actuelle
  updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString();

    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000); // Mise à jour toutes les secondes
  }
}
