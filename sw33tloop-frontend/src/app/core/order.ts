import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface PlaceOrderPayload {
  items: OrderItem[];
  total: number;
  location: string;
  paymentMethod: string;
}

export interface OrderResponse {
  data: {
    id: number;
    documentId: string;
    orderStatus: string;
  };
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private baseUrl = 'http://localhost:1337/api';

  constructor(private http: HttpClient, private auth: AuthService) {}

  placeOrder(payload: PlaceOrderPayload): Observable<OrderResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.auth.getToken()}`
    });

    // Strapi expects the record wrapped in a top-level "data" key
    return this.http.post<OrderResponse>(
      `${this.baseUrl}/orders`,
      { data: payload },
      { headers }
    );
  }
}