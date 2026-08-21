import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  StrapiService,
  Order,
  ContactMessage,
  MenuItem,
  MenuItemPayload,
  Service,
  ServicePayload
} from '../../core/strapi';
import { AuthService, AuthUser } from '../../core/auth';

type OrderStatus = Order['orderStatus'];
type Tab = 'orders' | 'messages' | 'menu-items' | 'services';

@Component({
  selector: 'app-admin',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  currentUser: AuthUser | null = null;
  activeTab: Tab = 'orders';

  orders: Order[] = [];
  messages: ContactMessage[] = [];
  menuItems: MenuItem[] = [];
  services: Service[] = [];

  loadingOrders = true;
  loadingMessages = true;
  loadingMenuItems = true;
  loadingServices = true;
  updatingOrderId: number | null = null;

  statusOptions: OrderStatus[] = ['pending', 'confirmed', 'delivered', 'cancelled'];

  // ---- Menu item form state ----
  menuItemForm: FormGroup;
  editingMenuItemId: string | null = null;
  savingMenuItem = false;
  menuItemError = '';

  // ---- Service form state ----
  serviceForm: FormGroup;
  editingServiceId: string | null = null;
  savingService = false;
  serviceError = '';

  constructor(
    private auth: AuthService,
    private strapi: StrapiService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.menuItemForm = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });

    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      desc: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    this.loadOrders();
    this.loadMessages();
    this.loadMenuItems();
    this.loadServices();
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.strapi.getAllOrders().subscribe({
      next: (res) => {
        this.orders = res.data;
        this.loadingOrders = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loadingOrders = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMessages(): void {
    this.loadingMessages = true;
    this.strapi.getContactMessages().subscribe({
      next: (res) => {
        this.messages = res.data;
        this.loadingMessages = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load contact messages', err);
        this.loadingMessages = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(order: Order, newStatus: OrderStatus): void {
    if (order.orderStatus === newStatus) return;

    this.updatingOrderId = order.id;
    this.strapi.updateOrderStatus(order.documentId, newStatus).subscribe({
      next: () => {
        order.orderStatus = newStatus;
        this.updatingOrderId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to update order status', err);
        this.updatingOrderId = null;
        this.cdr.detectChanges();
      }
    });
  }

  orderItemsSummary(order: Order): string {
    return order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
  }

  // ==================== MENU ITEMS ====================

  loadMenuItems(): void {
    this.loadingMenuItems = true;
    this.strapi.getMenuItems().subscribe({
      next: (res) => {
        this.menuItems = res.data;
        this.loadingMenuItems = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load menu items', err);
        this.loadingMenuItems = false;
        this.cdr.detectChanges();
      }
    });
  }

  startAddMenuItem(): void {
    this.editingMenuItemId = 'new';
    this.menuItemError = '';
    this.menuItemForm.reset({ name: '', desc: '', price: 0, category: '' });
  }

  startEditMenuItem(item: MenuItem): void {
    this.editingMenuItemId = item.documentId;
    this.menuItemError = '';
    this.menuItemForm.reset({
      name: item.name,
      desc: item.desc,
      price: item.price,
      category: item.category || ''
    });
  }

  cancelMenuItemEdit(): void {
    this.editingMenuItemId = null;
    this.menuItemError = '';
  }

  saveMenuItem(): void {
    if (this.menuItemForm.invalid) {
      this.menuItemForm.markAllAsTouched();
      return;
    }

    const payload: MenuItemPayload = this.menuItemForm.value;
    this.savingMenuItem = true;
    this.menuItemError = '';

    const request =
      this.editingMenuItemId === 'new'
        ? this.strapi.createMenuItem(payload)
        : this.strapi.updateMenuItem(this.editingMenuItemId as string, payload);

    request.subscribe({
      next: () => {
        this.savingMenuItem = false;
        this.editingMenuItemId = null;
        this.loadMenuItems();
      },
      error: (err) => {
        console.error('Failed to save menu item', err);
        this.savingMenuItem = false;
        this.menuItemError = 'Could not save this menu item. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteMenuItem(item: MenuItem): void {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      return;
    }

    this.strapi.deleteMenuItem(item.documentId).subscribe({
      next: () => this.loadMenuItems(),
      error: (err) => {
        console.error('Failed to delete menu item', err);
        alert('Could not delete this menu item.');
      }
    });
  }

  // ==================== SERVICES ====================

  loadServices(): void {
    this.loadingServices = true;
    this.strapi.getServices().subscribe({
      next: (res) => {
        this.services = res.data;
        this.loadingServices = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.loadingServices = false;
        this.cdr.detectChanges();
      }
    });
  }

  startAddService(): void {
    this.editingServiceId = 'new';
    this.serviceError = '';
    this.serviceForm.reset({ name: '', desc: '', price: 0, category: '' });
  }

  startEditService(service: Service): void {
    this.editingServiceId = service.documentId;
    this.serviceError = '';
    this.serviceForm.reset({
      name: service.name,
      desc: service.desc,
      price: service.price,
      category: service.category || ''
    });
  }

  cancelServiceEdit(): void {
    this.editingServiceId = null;
    this.serviceError = '';
  }

  saveService(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const payload: ServicePayload = this.serviceForm.value;
    this.savingService = true;
    this.serviceError = '';

    const request =
      this.editingServiceId === 'new'
        ? this.strapi.createService(payload)
        : this.strapi.updateService(this.editingServiceId as string, payload);

    request.subscribe({
      next: () => {
        this.savingService = false;
        this.editingServiceId = null;
        this.loadServices();
      },
      error: (err) => {
        console.error('Failed to save service', err);
        this.savingService = false;
        this.serviceError = 'Could not save this service. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteService(service: Service): void {
    if (!confirm(`Delete "${service.name}"? This cannot be undone.`)) {
      return;
    }

    this.strapi.deleteService(service.documentId).subscribe({
      next: () => this.loadServices(),
      error: (err) => {
        console.error('Failed to delete service', err);
        alert('Could not delete this service.');
      }
    });
  }
}