import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Product } from '../../models/product/product.model';
import { TypeService } from '../../services/type/type.service';
import { Type } from '../../models/type/type.model';
import { ProductService } from '../../services/product/product.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="products-page">
      <div class="products-grid">
        @for (product of products; track product.id_product) {
          <div class="product-card">
            <div class="product-image">
              <img [src]="product.imageUrls[0]" [alt]="product.name">
            </div>
            <div class="product-info">
              <h3>{{product.name}}</h3>
              <p class="description">{{product.description}}</p>
              <p class="price">
                @if (product.isPromoted) {
                  <span class="original-price">{{product.price | currency:'EUR'}}</span>
                  <span class="promotion-price">{{product.promotionPrice | currency:'EUR'}}</span>
                } @else {
                  {{product.price | currency:'EUR'}}
                }
              </p>
              <div class="stock-info">
                <span [class.low-stock]="product.stock < 10">
                  Stock: {{product.stock}}
                </span>
              </div>
              @if (product.stock > 0) {
                <button class="add-to-cart-btn" (click)="addToCart(product)">
                  Ajouter au panier
                </button>
              } @else {
                <button class="out-of-stock-btn" disabled>
                  Rupture de stock
                </button>
              }
            </div>
          </div>
        }
      </div>

      @if (isAdmin) {
        <div class="add-product-form">
          <h2>Ajouter un nouveau produit</h2>
          <form [formGroup]="productForm" (ngSubmit)="addProduct()">
            <div class="form-group">
              <label for="name">Nom du produit</label>
              <input id="name" formControlName="name" type="text">
              @if (productForm.get('name')?.errors?.['required'] && productForm.get('name')?.touched) {
                <span class="error-message">Le nom est requis</span>
              }
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" formControlName="description" rows="3"></textarea>
              @if (productForm.get('description')?.errors?.['required'] && productForm.get('description')?.touched) {
                <span class="error-message">La description est requise</span>
              }
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">Prix</label>
                <input id="price" formControlName="price" type="number" min="0" step="0.01">
                @if (productForm.get('price')?.errors?.['required'] && productForm.get('price')?.touched) {
                  <span class="error-message">Le prix est requis</span>
                }
              </div>

              <div class="form-group">
                <label for="stock">Stock</label>
                <input id="stock" formControlName="stock" type="number" min="0">
                @if (productForm.get('stock')?.errors?.['required'] && productForm.get('stock')?.touched) {
                  <span class="error-message">Le stock est requis</span>
                }
              </div>
            </div>

            <div class="form-group">
              <label for="type">Type de produit</label>
              <select id="type" formControlName="typeId">
                <option value="">Sélectionnez un type</option>
                @for (type of types; track type.id_type) {
                  <option [value]="type.id_type">{{type.name}}</option>
                }
              </select>
              @if (productForm.get('typeId')?.errors?.['required'] && productForm.get('typeId')?.touched) {
                <span class="error-message">Le type est requis</span>
              }
            </div>

            <div class="form-group">
              <label for="image">Image</label>
              <input type="file" id="image" (change)="onFileSelected($event)" accept="image/*">
            </div>

            @if (errorMessage) {
              <div class="error-message">{{errorMessage}}</div>
            }

            <button type="submit" class="submit-btn" [disabled]="!productForm.valid">
              Ajouter le produit
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [/* ... styles du composant précédent ... */]
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  types: Type[] = [];
  productForm: FormGroup;
  isAdmin: boolean = false; // À gérer avec votre service d'authentification
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private typeService: TypeService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      typeId: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadTypes();
    // Vérifiez si l'utilisateur est admin via votre service d'auth
    // this.isAdmin = this.authService.isAdmin();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  loadTypes(): void {
    this.typeService.getTypes().subscribe({
      next: (types) => {
        this.types = types;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }

  addToCart(product: Product): void {
    this.productService.addToCart(product, 1);
    // Vous pouvez ajouter une notification de succès ici
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const newProduct: Product = {
        ...this.productForm.value,
        id_product: 0, // You can set a default value or handle it accordingly
        imageUrls: [] // Sera mis à jour après l'upload de l'image
      };

      // Ici, vous devriez d'abord uploader l'image si selectedFile existe
      // puis ajouter l'URL de l'image au tableau imageUrls

      this.productService.createProduct(newProduct).subscribe({
        next: () => {
          this.loadProducts();
          this.productForm.reset();
          this.selectedFile = null;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
        }
      });
    }
  }
}
