import { Component, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { CheckoutService } from '../../services/checkout/checkout.service';
import { CartService } from '../../services';
import { NotificationService } from '../../services/notification/notification.service';
import { NewOrder } from '../../models/order/order.model';
import { CartItem } from '../../models/cart/cart-item.model';
import {CommonModule} from '@angular/common';
import {PaypalButtonComponent} from '../PayPal/paypal-button.component';
import {PaymentComponent} from '../payment/payment.component';
import {
  ClientProfileComponent
} from "../../feature/dashboard/DashboardComponent/client/profile/client-profile.component";

import { ClientService } from '../../services/client/client.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PaypalButtonComponent,
    PaymentComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = []; // Liste des articles dans le panier
  readyToPay = false; // Indique si le paiement est prêt à être traité
  amount: number = 0; // Montant total à payer

  // on récupère le clientid pour pouvoir aller récupérer l'adresse du client
  credential: string | null = localStorage.getItem("clientId");

  constructor(
    private router: Router, // Service de navigation
    private checkoutService: CheckoutService, // Service de gestion de la commande
    private cartService: CartService, // Service de gestion du panier
    private notificationService: NotificationService, // Service pour afficher des notifications
    private clientService: ClientService, // pour afficher l'adresse
  ) {}

  ngOnInit() {
    this.loadCartItems(); // Charge les articles du panier lors de l'initialisation
    this.loadAdress();
  }

  // ceci va charger l'adresse du client by Claudio
  loadAdress(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      console.log(this.credential);
      return;
    }
    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        ClientProfileComponent.adresse = data.address;
        console.log("Pseudo =", ClientProfileComponent.pseudo);
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
      },
    });
  }

  // ceci charge les items du caddie
  loadCartItems() {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        console.log('Items reçus:', items); // Log des articles récupérés
        this.cartItems = items; // Mise à jour des articles du panier
        this.amount = this.calculateTotal(); // Calcul du montant total
        console.log('Total calculé:', this.amount);
      },
      error: (error) => {
        console.error('Erreur chargement panier:', error); // Log de l'erreur
        this.notificationService.error('Erreur lors du chargement du panier'); // Notification en cas d'erreur
      }
    });
  }

  hasActivePromotion(item: CartItem): boolean {
    return !!(item.product.promotion && this.isPromotionActive(item.product.promotion)); // Vérifie si une promotion est active
  }

  isPromotionActive(promotion: any): boolean {
    if (!promotion) return false; // Pas de promotion active
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate; // Vérifie si la date actuelle est dans la période de promotion
  }

  calculateDiscountedPrice(item: CartItem): number {
    if (!this.hasActivePromotion(item) || !item.product.promotion) {
      return item.unit_price; // Retourne le prix unitaire si pas de promotion
    }

    const basePrice = typeof item.product.price === 'string'
      ? parseFloat(item.product.price) // Convertit une chaîne en nombre si nécessaire
      : item.product.price;

    const discountedPrice = basePrice * (1 - item.product.promotion.discountPercentage / 100); // Calcule le prix remisé
    return Number(discountedPrice.toFixed(2)); // Arrondit à 2 décimales
  }

  calculateTotal(): number {
    const total = this.cartItems.reduce((sum, item) => {
      const price = this.hasActivePromotion(item)
        ? this.calculateDiscountedPrice(item) // Calcule le prix remisé si applicable
        : item.unit_price;
      return sum + (price * item.quantity); // Somme les montants des articles
    }, 0);
    return Number(total.toFixed(2)); // Retourne le total arrondi
  }

  prepareOrderData(): NewOrder {
    const clientId = localStorage.getItem('clientId'); // Récupère l'ID du client connecté
    if (!clientId) {
      throw new Error('Client non connecté'); // Erreur si pas de client connecté
    }

    return {
      clientId: Number(clientId),
      date_order: new Date().toISOString(), // Date actuelle au format ISO
      orderLines: this.cartItems.map(item => ({
        id_product: item.product.id_product,
        quantity: item.quantity,
        unit_price: this.hasActivePromotion(item)
          ? this.calculateDiscountedPrice(item) // Prix remisé si promotion
          : item.unit_price
      }))
    };
  }

  handlePaymentSuccess(paymentInfo: any) {
    try {
      console.log('Début du processus de paiement');
      const orderData = {
        ...this.prepareOrderData(),
        paymentInfo // Ajoute les informations de paiement
      };
      console.log('Données de commande préparées:', orderData);

      this.checkoutService.createOrderFromCart().subscribe({
        next: (order) => {
          console.log('Commande créée avec succès:', order);
          this.notificationService.success('Commande créée avec succès !'); // Notification de succès
          this.router.navigate(['/order-confirmation', order.id]); // Redirection après succès
        },
        error: (error) => {
          console.error('Erreur création commande:', error);
          this.notificationService.error('Erreur lors de la création de la commande'); // Notification d'erreur
        }
      });
    } catch (error) {
      console.error('Erreur lors de la préparation de la commande:', error);
      this.notificationService.error('Erreur lors de la préparation de la commande'); // Notification d'erreur
    }
  }

  protected readonly ClientProfileComponent = ClientProfileComponent;
}
