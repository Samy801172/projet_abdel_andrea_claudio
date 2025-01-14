import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../../services/product/product.service';
import { TypeService } from '../../../../../services/type/type.service';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { PromotionService } from '../../../../../services/promotion/promotion.service';
import { Product } from '../../../../../models/product/product.model';
import { Type } from '../../../../../models/type/type.model';
import { Promotion } from '../../../../../models/promotion/promotion.model';

// Dans admin-products.component.ts
interface ProductWithPromotion extends Product {
  activePromotion?: {
    id_promotion: number;
    description: string;
    discountPercentage: number;
    // Ajout des dates manquantes
    startDate: string | Date;
    endDate: string | Date;
  };
  selectedPromotionId?: number;
  promotionPrice?: number;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-products.component.html',
  styleUrl: 'admin-products.component.scss'
})
export class AdminProductsComponent implements OnInit {
  products: ProductWithPromotion[] = [];
  availablePromotions: Promotion[] = [];
  showAddForm = false;
  editingProduct: Product | null = null;
  types: Type[] = [];

  constructor(
    private productService: ProductService,
    private promotionService: PromotionService,
    private notificationService: NotificationService,
    private typeService: TypeService
  ) {}

  newProduct = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    active: true,
    typeId: 0
  };

  ngOnInit() {
    this.loadProducts();
    this.loadPromotions();
    this.loadTypes();
  }

  loadTypes(): void {
    this.typeService.getTypes().subscribe({
      next: (typesData: Type[]) => {
        this.types = typesData;
      },
      error: () => this.notificationService.error('Erreur lors du chargement des catégories')
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  onSubmit(): void {
    if (this.editingProduct) {
      this.updateProduct();
    } else {
      this.addProduct();
    }
  }

  addProduct(): void {
    // Vérifiez si un produit avec le même nom existe déjà
    const productExists = this.products.some(product => product.name.toLowerCase() === this.newProduct.name.toLowerCase());

    if (productExists) {
      this.notificationService.error('Un produit avec ce nom existe déjà');
      return;
    }

    const newProduct: Product = {
      ...this.newProduct,
      id_product: 0,
      imageUrls: []
    };

    this.productService.createProduct(newProduct).subscribe({
      next: () => {
        this.notificationService.success('Produit ajouté avec succès');
        this.loadProducts();
        this.toggleAddForm();
      },
      error: () => this.notificationService.error('Erreur lors de l\'ajout du produit')
    });
  }


  updateProduct(): void {
    if (!this.editingProduct) return;

    // Convertir les valeurs numériques
    const updatedProduct: Product = {
      ...this.newProduct,
      id_product: this.editingProduct.id_product,
      price: Number(this.newProduct.price),
      stock: Number(this.newProduct.stock),
      typeId: Number(this.newProduct.typeId),
      imageUrls: this.editingProduct.imageUrls || []
    };

    console.log('Updating product with data:', updatedProduct);

    this.productService.updateProduct(this.editingProduct.id_product, updatedProduct).subscribe({
      next: (response) => {
        console.log('Product updated successfully:', response);
        this.notificationService.success('Produit mis à jour avec succès');
        this.loadProducts();
        this.toggleAddForm();
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.notificationService.error('Erreur lors de la mise à jour: ' +
          (error.error?.message || 'Une erreur est survenue'));
      }
    });
  }
  loadPromotions() {
    this.promotionService.getActivePromotions().subscribe({
      next: (promotions) => {
        this.availablePromotions = promotions;
      },
      error: (error) => {
        console.error('Erreur chargement promotions:', error);
        this.notificationService.error('Erreur lors du chargement des promotions');
      }
    });
  }



  editProduct(product: Product): void {
    console.log('Editing product:', product);
    this.editingProduct = {...product};
    this.newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      active: product.active,
      typeId: product.typeId || 0
    };
    this.showAddForm = true;
  }

  deleteProduct(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.success('Produit supprimé');
          this.loadProducts();
        },
        error: () => this.notificationService.error('Erreur lors de la suppression')
      });
    }
  }


  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products received:', products);
        this.products = products.map(product => {
          // Vérifier si le produit a une promotion active
          const hasActivePromotion = product.promotion && this.isPromotionActive(product.promotion);

          return {
            ...product,
            activePromotion: hasActivePromotion && product.promotion ? {
              id_promotion: product.promotion.id_promotion,
              description: product.promotion.description,
              discountPercentage: product.promotion.discountPercentage,
              startDate: product.promotion.startDate,
              endDate: product.promotion.endDate
            } : undefined,
            selectedPromotionId: hasActivePromotion && product.promotion ?
              product.promotion.id_promotion :
              undefined
          };
        });
        console.log('Mapped products:', this.products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Erreur lors du chargement des produits');
      }
    });
  }

  isPromotionActive(promotion: ProductWithPromotion['promotion']): boolean {
    if (!promotion) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  applyPromotion(product: ProductWithPromotion, promotionId: number | undefined | null) {
    if (!promotionId) return;

    console.log('Applying promotion:', { product, promotionId });

    this.productService.applyPromotion(product.id_product, promotionId).subscribe({
      next: () => {
        // Trouver la promotion sélectionnée
        const selectedPromotion = this.availablePromotions.find(
          p => p.id_promotion === promotionId
        );

        if (selectedPromotion) {
          product.activePromotion = {
            id_promotion: selectedPromotion.id_promotion,
            description: selectedPromotion.description,
            discountPercentage: selectedPromotion.discountPercentage,
            startDate: selectedPromotion.startDate,
            endDate: selectedPromotion.endDate
          };
          product.promotionPrice = product.price * (1 - selectedPromotion.discountPercentage / 100);
        }

        this.notificationService.success('Promotion appliquée avec succès');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error applying promotion:', error);
        this.notificationService.error(
          'Erreur lors de l\'application de la promotion: ' +
          (error.error?.message || 'Une erreur est survenue')
        );
        product.selectedPromotionId = undefined;
      }
    });
  }
  resetForm(): void {
    this.editingProduct = null;
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      active: true,
      typeId: 0
    };
  }
}
