import { Component, OnInit } from '@angular/core';
import {DatePipe, NgClass} from "@angular/common"
import { ClientService } from '../../../../../services';
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {LoginComponent} from "../../../../../components/Login/login.component";

@Component({
  selector: 'app-dash',
  templateUrl: './admin-dash.component.html',
  standalone: true,
  imports: [
    NgClass,
    DatePipe
  ],
  styleUrls: ['./admin-dash.component.scss']
})
export class AdminDashComponent implements OnInit {
  title: string = 'Tableau de bord'; // Titre
  stats: any[] = []; // Statistiques rapides
  recentMessages: any[] = []; // Messages récents
  pendingTasks: any[] = []; // Tâches en attente
  currentTime: string = ''; // Heure actuelle
  isLoading: boolean = true; // Indicateur de chargement

  constructor(private clientService: ClientService,) {}
  credential: string | null = localStorage.getItem("clientId");
  client: any;
  editForm: any = {}; // Initialisation de l'objet utilisé pour l'édition

  ngOnInit(): void {
    this.loadDashboardData(); // Charger les données du tableau de bord
    this.updateCurrentTime(); // Mettre à jour l'heure actuelle
    this.loadNickname(); // charge les données de l'admin
  }

  // ceci va charger l'username du client
  loadNickname(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      console.log(this.credential);
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

  loadDashboardData(): void {
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

  updateCurrentTime(): void {
    this.currentTime = new Date().toLocaleTimeString();

    setInterval(() => {
      this.currentTime = new Date().toLocaleTimeString();
    }, 1000); // Mise à jour toutes les secondes
  }
}
