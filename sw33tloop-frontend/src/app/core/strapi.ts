import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

// Base Strapi response shapes
export interface StrapiImage {
  id: number;
  url: string;
  name: string;
}

export interface MenuItem {
  id: number;
  documentId: string;
  name: string;
  desc: string;
  price: number;
  category?: string;
  image?: StrapiImage;
}

export interface MenuItemPayload {
  name: string;
  desc: string;
  price: number;
  category?: string;
}

export interface Service {
  id: number;
  documentId: string;
  name: string;
  desc: string;
  price: number;
  category?: string;
  image?: StrapiImage;
}

export interface ServicePayload {
  name: string;
  desc: string;
  price: number;
  category?: string;
}

export interface TeamMember {
  id: number;
  documentId: string;
  name: string;
  role: string;
  position: string;
  photo?: StrapiImage;
}

export interface HeroSlide {
  id: number;
  documentId: string;
  caption: string;
  order: number;
  image?: StrapiImage;
}

export interface BusinessInfo {
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  tiktok: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage extends ContactMessagePayload {
  id: number;
  documentId: string;
  createdAt: string;
}

export interface OrderItemSnapshot {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  items: OrderItemSnapshot[];
  total: number;
  location: string;
  phone: string;
  paymentMethod: 'cash' | 'bank';
}

export interface Order extends OrderPayload {
  id: number;
  documentId: string;
  orderStatus: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

@Injectable({ providedIn: 'root' })
export class StrapiService {
  // Base URL of your Strapi backend. Change this when you deploy later.
  private baseUrl = 'http://localhost:1337/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ---- Menu Items ----
  getMenuItems(): Observable<{ data: MenuItem[] }> {
    return this.http.get<{ data: MenuItem[] }>(
      `${this.baseUrl}/menu-items?populate=image&pagination[pageSize]=100`
    );
  }

  // ---- Admin: Menu Items CRUD ----
  createMenuItem(payload: MenuItemPayload): Observable<{ data: MenuItem }> {
    return this.http.post<{ data: MenuItem }>(
      `${this.baseUrl}/menu-items`,
      { data: payload },
      { headers: this.authHeaders() }
    );
  }

  updateMenuItem(documentId: string, payload: MenuItemPayload): Observable<{ data: MenuItem }> {
    return this.http.put<{ data: MenuItem }>(
      `${this.baseUrl}/menu-items/${documentId}`,
      { data: payload },
      { headers: this.authHeaders() }
    );
  }

  deleteMenuItem(documentId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/menu-items/${documentId}`,
      { headers: this.authHeaders() }
    );
  }

  // ---- Services ----
  getServices(): Observable<{ data: Service[] }> {
    return this.http.get<{ data: Service[] }>(
      `${this.baseUrl}/services?populate=image&pagination[pageSize]=100`
    );
  }

  // ---- Admin: Services CRUD ----
  createService(payload: ServicePayload): Observable<{ data: Service }> {
    return this.http.post<{ data: Service }>(
      `${this.baseUrl}/services`,
      { data: payload },
      { headers: this.authHeaders() }
    );
  }

  updateService(documentId: string, payload: ServicePayload): Observable<{ data: Service }> {
    return this.http.put<{ data: Service }>(
      `${this.baseUrl}/services/${documentId}`,
      { data: payload },
      { headers: this.authHeaders() }
    );
  }

  deleteService(documentId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/services/${documentId}`,
      { headers: this.authHeaders() }
    );
  }

  // ---- Team Members ----
  getTeamMembers(): Observable<{ data: TeamMember[] }> {
    return this.http.get<{ data: TeamMember[] }>(
      `${this.baseUrl}/team-members?populate=photo`
    );
  }

  // ---- Hero Slides ----
  getHeroSlides(): Observable<{ data: HeroSlide[] }> {
    return this.http.get<{ data: HeroSlide[] }>(
      `${this.baseUrl}/hero-slides?populate=image&sort=order:asc`
    );
  }

  // ---- Business Info (single type) ----
  getBusinessInfo(): Observable<{ data: BusinessInfo }> {
    return this.http.get<{ data: BusinessInfo }>(`${this.baseUrl}/business-info`);
  }

  // ---- Contact Form Submission ----
  sendContactMessage(payload: ContactMessagePayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/contact-messages`, { data: payload });
  }

  // ---- Create Order (requires login -- backend also enforces this) ----
  createOrder(payload: OrderPayload): Observable<{ data: Order }> {
    // orderStatus is not set by the client -- it always starts as
    // 'pending' server-side (or via a default value in Strapi's schema).
    // users_permissions_user is attached automatically by the order
    // controller based on who's logged in, so it's never sent from here.
    return this.http.post<{ data: Order }>(
      `${this.baseUrl}/orders`,
      { data: { ...payload, orderStatus: 'pending' } },
      { headers: this.authHeaders() }
    );
  }

  // ---- Admin: Orders ----
  // Returns ALL orders if the logged-in user is an admin (enforced by
  // the backend controller too), or just their own orders otherwise.
  getAllOrders(): Observable<{ data: Order[] }> {
    return this.http.get<{ data: Order[] }>(
      `${this.baseUrl}/orders?sort=createdAt:desc&pagination[pageSize]=100`,
      { headers: this.authHeaders() }
    );
  }

  updateOrderStatus(
    documentId: string,
    orderStatus: Order['orderStatus']
  ): Observable<{ data: Order }> {
    return this.http.put<{ data: Order }>(
      `${this.baseUrl}/orders/${documentId}`,
      { data: { orderStatus } },
      { headers: this.authHeaders() }
    );
  }

  // ---- Admin: Contact Messages ----
  getContactMessages(): Observable<{ data: ContactMessage[] }> {
    return this.http.get<{ data: ContactMessage[] }>(
      `${this.baseUrl}/contact-messages?sort=createdAt:desc&pagination[pageSize]=100`,
      { headers: this.authHeaders() }
    );
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.getToken()}` });
  }

  // ---- Helper: build a full image URL from a Strapi image object ----
  getImageUrl(image?: StrapiImage): string {
    if (!image) return '';
    return `http://localhost:1337${image.url}`;
  }
}