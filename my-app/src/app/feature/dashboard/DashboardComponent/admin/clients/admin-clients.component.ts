import { Component, OnInit } from '@angular/core';
import {CommonModule} from "@angular/common";
import { ClientService } from '../../../../../services';
import { NotificationService } from '../../../../../services/notification/notification.service';
import {clientGuard} from "../../../guard/client.guard";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.scss'
})
export class AdminClientsComponent implements OnInit {
  // Récupère tous les clients
  Tousclients:any = [];
  // Liste des commandes d'un client sélectionné
  isModalOpen = false;
  selectedClient: any = null;
  selectedClientOrders: any[] = [];
  PathUrl: string = "http://localhost:2024";

  filteredClients = [...this.Tousclients];

  constructor(private clientService: ClientService, private notification: NotificationService,) {}

  ngOnInit(): void {
    this.LoadClient();
  }

  LoadClient(): void {

    // Appel au service pour récupérer les clients
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.Tousclients = data; // Charger les données dans la liste des clients
        this.filteredClients = [...this.Tousclients]; // Initialiser les données filtrées

      },
      error: (error) => {
        console.error('Erreur lors du chargement des clients :', error);
      },
    });
  }

  addClient(): void {
    alert('Ajouter un client en développement');
  }

  editClient(clientId: number): void {
    alert(`Modifier le client ID: ${clientId}`);
  }

  deleteClient(clientId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.Tousclients = this.Tousclients.filter((client: { id: number; }) => client.id !== clientId);
      this.filteredClients = [...this.Tousclients];
    }
  }

  viewOrders(clientId: number): void {
    alert(`Voir les commandes pour le client ID: ${clientId}`);
  }

  grantAdmin(clientId: number): void {
    if (confirm(`Êtes-vous sûr de vouloir accorder des privilèges administratifs au client ID: ${clientId} ?`)) {
      alert(`Privilèges administratifs accordés au client ID: ${clientId}`);
    }
  }

  logout(): void {
    alert('Déconnexion');
  }

  filterClients(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredClients = this.Tousclients.filter((client: { firstName: string; lastName: string; }) =>
      client.firstName.toLowerCase().includes(searchText) ||
      client.lastName.toLowerCase().includes(searchText)
    );
  }

  filterByStatus(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    if (status === 'all') {
      this.filteredClients = [...this.Tousclients];
    } else {
      const isActive = status === 'true'; // Convertit la chaîne en booléen
      this.filteredClients = this.Tousclients.filter((client: { credential: { active: boolean; }; }) => client.credential.active === isActive);
    }
  }


  openOrdersModal(client: any): void {
    this.selectedClient = client;
    this.checkClientOrder(client.clientId);
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedClient = null;
    this.selectedClientOrders = [];
  }

  // Admin consulte les commandes d'un client
  checkClientOrder(clientId: number): void {
    this.clientService.getClientOrders(clientId).subscribe({
      next: (orders: any[]) => {
        console.log(`Commandes pour le client ID ${clientId}:`, orders);

        // Stockez les commandes dans une propriété si vous souhaitez les afficher
        this.selectedClientOrders = orders;
        this.isModalOpen = true;

        // Optionnel : Ajouter une notification de succès
        this.notification.success(`Les commandes du client ID ${clientId} ont été chargées.`);
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des commandes :', error);
        this.notification.error(`Le client avec l'id : ${clientId} n'a pas encore effectué de commande.`);
        this.isModalOpen = true;
      }
    });
  }


  // Mettre un client Admin ou retirer les privilèges Admin
  PutAdminOrNot(clientId: number): void {
    // Trouver le client localement
    const client = this.Tousclients.find((client: any) => client.clientId === clientId);
    if (!client) {
      this.notification.error(`Client avec l'ID ${clientId} non trouvé.`);
      return;
    }
    // Inverser le statut actuel de isAdmin
    const newIsAdminStatus = !client.credential.isAdmin;
    const actionText = newIsAdminStatus ? 'ajouter les privilèges admin' : 'retirer les privilèges admin';

    // Afficher une boîte de confirmation
    if (!window.confirm(`Êtes-vous sûr de vouloir ${actionText} pour le client ID: ${clientId} ?`)) {
      return; // Annuler l'action si non confirmé
    }
    // Appeler le servise avec le nouveau statut
    this.clientService.updateProfileToPutAdmin(clientId, { isAdmin: newIsAdminStatus }).subscribe({
      next: (updatedClient: any) => {
        if (updatedClient) {
          // Mettre à jour localement le client
          const index = this.Tousclients.findIndex((c: any) => c.clientId === clientId);
          if (index !== -1) {
            this.Tousclients[index] = updatedClient;
          }
          const statusText = newIsAdminStatus ? 'activé' : 'désactivé';
          this.notification.success(`Les privilèges admin ont été ${statusText} pour le client ID: ${clientId}`);
          // Ajout d'un délai avant de recharger la page
          setTimeout(() => {
            window.location.reload(); // Actualiser la page
          }, 1000); // après 1 seconde
        }
      },
      error: (error) => {
        console.error('Erreur mise à jour profil:', error);
        this.notification.error(`Erreur lors de la mise à jour des privilèges admin pour le client ID: ${clientId}`);
      }
    });
  }

  // Bannir un client
  BanClient(clientId: number): void {
    const client = this.Tousclients.find((client: any) => client.clientId === clientId);
    if (!client)
    {
      this.notification.error(`Client avec l'ID ${clientId} non trouvé.`);
      return;
    }

// ici on empeche de pouvoir bannir les admins (une espèce de protection)
if(!client.credential.isAdmin)
{
  // Inverser le statut actuel de isBan
  const IsBan = !client.credential.ban;
  const actionText = IsBan ? 'dé-bannir' : 'bannir';

  // Afficher une boîte de confirmation
  if (!window.confirm(`Êtes-vous sûr de vouloir ${actionText} pour le client ID: ${clientId} ?`)) {
    return; // Annuler l'action si non confirmé
  }
  this.clientService.updateBanClient(clientId, { ban: IsBan }).subscribe({
    next: (updatedClient: any) => {
      if (updatedClient) {
        // Mettre à jour localement le client
        const index = this.Tousclients.findIndex((c: any) => c.clientId === clientId);
        if (index !== -1) {
          this.Tousclients[index] = updatedClient;
        }

        const statusText = IsBan ? 'en règle' : 'banni';
        this.notification.success(`Le status: "${statusText}" a bien été appliqué pour le client ID: ${clientId}`);

        // Ajout d'un délai avant de recharger la page
        setTimeout(() => {
          window.location.reload(); // Actualiser la page
        }, 1000); // après 1 seconde
      }
    },
    error: (error) => {
      console.error('Erreur mise à jour profil:', error);
      this.notification.error(`Erreur lors de la tentative pour bannir : ${clientId}`);
    }
  });
}else{
  this.notification.error(`Impossible d'appliquer le status banni à cet utilisateur car il est admin !`);
}
}

}

