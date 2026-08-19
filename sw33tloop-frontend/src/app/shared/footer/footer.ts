import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StrapiService, BusinessInfo } from '../../core/strapi';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer implements OnInit {
  info: BusinessInfo | null = null;

  constructor(private strapi: StrapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.strapi.getBusinessInfo().subscribe({
      next: (res) => {
        this.info = res.data;
        console.log('Business info loaded:', this.info);
        this.cdr.detectChanges();
        console.log('Change detection forced.');
      },
      error: (err) => console.error('Failed to load business info', err)
    });
  }
}