import { Component, OnInit } from '@angular/core';
import { DatePipe, NgClass } from "@angular/common";
import { ClientService } from '../../../../../services';
import { AppointmentsService } from '../../../../../services/appointment/appointment.service';
import { OrderService } from '../../../../../services';
import { PublicService } from '../../../../../services/pubic/public.service';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { WeatherService } from '../../../../../services/weather/weather.service'; // Service météo
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  title: string = 'Tableau de bord'; // Titre affiché
  currentTime: string = ''; // Heure actuelle
  isLoading: boolean = true; // Indicateur de chargement

  // Statistiques générales
  stats: any[] = [];
  recentMessages: any[] = [];
  pendingTasks: any[] = [];

  // Rendez-vous
  pendingAppointments: number = 0;
  confirmedAppointments: number = 0;
  canceledAppointments: number = 0;
  totalAppointment: number = 0;

  // Commandes
  orderTotal: number = 0;
  pendingOrders: number = 0;
  confirmedOrders: number = 0;
  canceledOrders: number = 0;
  totalOrders: number = 0;

  // Ordonnances
  pendingOrdonnance: number = 0;
  ordonnanceTotal: number = 0;

  // Identité du client connecté
  credential: string | null = localStorage.getItem("clientId");
  client: any;
  editForm: any = {};

  // Météo
  weatherData: any;
  city: string = 'Liège'; // Ville par défaut
  latitude: number = 50.63373; // Coordonnées GPS pour Paris
  longitude: number = 5.56749;

  constructor(
    private clientService: ClientService,
    private appointmentsService: AppointmentsService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private publicService: PublicService,
    private weatherService: WeatherService, // Service météo intégré
    private router: Router
  ) { }

  /**
   * Exécuté à l'initialisation du composant.
   * Charge toutes les données du tableau de bord.
   */
  ngOnInit(): void {
    this.loadDashboardData();
    this.updateCurrentTime();
    this.loadNickname();
    this.LoadAppointmentsNotConfirmed();
    this.LoadAppointmentsConfirmed();
    this.LoadAppointmentsCanceled();
    this.loadOrderCount();
    this.LoadOrdersNotConfirmed();
    this.LoadOrdersConfirmed();
    this.LoadOrdersCanceled();
    this.loadOrdonnanceCount();
    this.LoadOrdonnanceNotConfirmed();
    this.loadWeather(); // 🔥 Charge la météo
  }

  /**
   * Récupère la météo en utilisant Open-Meteo (100% gratuit et sans clé API).
   */
  loadWeather(): void {
    this.weatherService.getWeather(this.latitude, this.longitude).subscribe({
      next: (data: { current_weather: any; }) => {
        console.log("Données météo :", data);
        this.weatherData = data.current_weather; // Stocke uniquement la météo actuelle
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des données météo', error);
      }
    });
  }

  /**
   * Retourne une description en français selon le code météo d'Open-Meteo.
   */
  getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: "Ciel dégagé ☀️",
      1: "Partiellement nuageux ⛅",
      2: "Nuageux ☁️",
      3: "Couvert 🌥️",
      45: "Brouillard 🌫️",
      48: "Brouillard givrant ❄️🌫️",
      51: "Bruine légère 🌧️",
      53: "Bruine 🌧️",
      55: "Forte bruine 🌧️",
      61: "Pluie légère 🌦️",
      63: "Pluie 🌧️",
      65: "Forte pluie 🌧️",
      71: "Neige légère ❄️",
      73: "Neige ❄️",
      75: "Neige forte ❄️❄️",
      80: "Averses légères 🌦️",
      81: "Averses 🌦️",
      82: "Fortes averses ⛈️",
      95: "Orages ⚡",
      96: "Orages avec grêle ⚡❄️",
      99: "Orages violents ⚡⚡"
    };
    return descriptions[code] || "Météo inconnue 🤷‍♂️";
  }


  /**
   * Met à jour l'heure toutes les secondes.
   */
  updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString();
    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000);
  }

  /**
   * Charge le profil du client connecté.
   */
  loadNickname(): void {
    if (!this.credential) {
      console.warn('Credential non défini, impossible de charger le profil.');
      return;
    }
    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        this.client = data;
        this.editForm = { ...this.client };
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
      }
    });
  }

  /**
   * Charge les statistiques générales du tableau de bord.
   */
  loadDashboardData(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.stats = [
        { label: 'Utilisateurs', value: 100 },
        { label: 'Produits', value: 50 },
        { label: 'Commandes', value: 30 },
        { label: 'Revenus', value: '€ 5,000' }
      ];
      this.isLoading = false;
    }, 2000);
  }

  // 📌 Méthodes pour charger les commandes et rendez-vous

  loadOrderCount(): void {
    this.publicService.orderCount().subscribe({
      next: (count: number) => this.orderTotal = count,
      error: (error) => console.error('Erreur chargement commandes:', error)
    });
  }

  LoadAppointmentsNotConfirmed(): void {
    this.publicService.appointmentsCount().subscribe({
      next: (count: number) => this.pendingAppointments = count,
      error: (error) => console.error('Erreur chargement rendez-vous:', error)
    });
  }

  LoadAppointmentsConfirmed(): void {
    this.publicService.appointmentsCountConfirmed().subscribe({
      next: (count: number) => {
        this.confirmedAppointments = count;
        this.totalAppointment += this.confirmedAppointments;
      },
      error: (error) => console.error('Erreur chargement rendez-vous:', error)
    });
  }

  LoadAppointmentsCanceled(): void {
    this.publicService.appointmentsCountConfirmed().subscribe({
      next: (count: number) => {
        this.canceledAppointments = count;
        this.totalAppointment += this.canceledAppointments;
      },
      error: (error) => console.error('Erreur chargement rendez-vous:', error)
    });
  }

  LoadOrdersNotConfirmed(): void {
    this.publicService.ordersCount().subscribe({
      next: (count: number) => this.pendingOrders = count,
      error: (error) => console.error('Erreur chargement commandes:', error)
    });
  }

  LoadOrdersConfirmed(): void {
    this.publicService.ordersCountConfirmed().subscribe({
      next: (count: number) => {
        this.confirmedOrders = count;
        this.totalOrders += this.confirmedOrders;
      },
      error: (error) => console.error('Erreur chargement commandes:', error)
    });
  }

  LoadOrdersCanceled(): void {
    this.publicService.ordersCountConfirmed().subscribe({
      next: (count: number) => {
        this.canceledOrders = count;
        this.totalOrders += this.canceledOrders;
      },
      error: (error) => console.error('Erreur chargement commandes:', error)
    });
  }

  loadOrdonnanceCount(): void {
    this.publicService.ordonnanceCount().subscribe({
      next: (count: number) => this.ordonnanceTotal = count,
      error: (error) => console.error('Erreur chargement ordonnances:', error)
    });
  }

  LoadOrdonnanceNotConfirmed(): void {
    this.publicService.ordonnanceCount().subscribe({
      next: (count: number) => this.pendingOrdonnance = count,
      error: (error) => console.error('Erreur chargement ordonnances:', error)
    });
  }

  // 📌 Méthodes de navigation

  onManageAppointments(): void {
    this.router.navigate(['admin/appointments']);
  }

  onManageOrders(): void {
    this.router.navigate(['admin/orders']);
  }

  onManageOrdonnance(): void {
    this.router.navigate(['admin/prescriptions']);
  }
}
