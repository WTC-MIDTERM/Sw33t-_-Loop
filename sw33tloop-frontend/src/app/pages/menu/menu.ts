import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StrapiService, MenuItem } from '../../core/strapi';

@Component({
  selector: 'app-menu',
  imports: [],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  items: MenuItem[] = [];

  constructor(private strapi: StrapiService, private cdr: ChangeDetectorRef) {}

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
}