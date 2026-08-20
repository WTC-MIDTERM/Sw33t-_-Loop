import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StrapiService, MenuItem } from '../../core/strapi';
import { CartService } from '../../core/cart';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  items: MenuItem[] = [];
  addedItemId: number | null = null;

  constructor(
    private strapi: StrapiService,
    private cdr: ChangeDetectorRef,
    private cart: CartService
  ) {}

  ngOnInit(): void {
    this.strapi.getMenuItems().subscribe({
      next: (res) => {
        this.items = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load menu items', err)
    });
  }

  getImageUrl(item: MenuItem): string {
    return this.strapi.getImageUrl(item.image);
  }

  addToCart(item: MenuItem): void {
    this.cart.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: this.getImageUrl(item)
    });

    // Brief visual confirmation on the button that was clicked
    this.addedItemId = item.id;
    setTimeout(() => {
      this.addedItemId = null;
      this.cdr.detectChanges();
    }, 800);
  }
}