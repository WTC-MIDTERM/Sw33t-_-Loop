import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth';
import { CartService } from '../../core/cart';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  menuOpen = false;
  accountMenuOpen = false;

  constructor(public auth: AuthService, public cart: CartService, private router: Router) {}

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.accountMenuOpen = false;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.accountMenuOpen = false;
  }

  toggleAccountMenu(event: Event): void {
    event.stopPropagation();
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.accountMenuOpen = false;
  }
}