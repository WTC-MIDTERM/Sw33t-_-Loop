import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StrapiService, BusinessInfo } from '../../core/strapi';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements OnInit {
  info: BusinessInfo | null = null;
  form: FormGroup;
  submitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(
    private strapi: StrapiService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.strapi.getBusinessInfo().subscribe({
      next: (res) => {
        this.info = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load business info', err)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    this.strapi.sendContactMessage(this.form.value).subscribe({
      next: () => {
        this.submitting = false;
        this.submitSuccess = true;
        this.form.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to send message', err);
        this.submitting = false;
        this.submitError = true;
        this.cdr.detectChanges();
      }
    });
  }
}