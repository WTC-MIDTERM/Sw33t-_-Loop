import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StrapiService, HeroSlide } from '../../core/strapi';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  slides: HeroSlide[] = [];
  currentIndex = 0;

  constructor(private strapi: StrapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.strapi.getHeroSlides().subscribe({
      next: (res) => {
        this.slides = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load hero slides', err)
    });
  }

  getImageUrl(slide: HeroSlide): string {
    return this.strapi.getImageUrl(slide.image);
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  nextSlide(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }
}