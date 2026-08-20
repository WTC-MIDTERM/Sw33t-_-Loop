import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StrapiService, MenuItem } from '../../core/strapi';
import { AuthService, AuthUser } from '../../core/auth';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  currentUser: AuthUser | null = null;
  menuItemCount = 0;

  constructor(
    private auth: AuthService,
    private strapi: StrapiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();

    this.strapi.getMenuItems().subscribe({
      next: (res) => {
        this.menuItemCount = res.data.length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load menu items', err)
    });
  }
}