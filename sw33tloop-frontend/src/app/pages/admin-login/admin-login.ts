import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css'
})
export class AdminLogin {
  form: FormGroup;
  submitting = false;
  errorMessage = '';
  private returnUrl = '/admin';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required]
    });

    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    this.returnUrl = requested && requested.startsWith('/admin') ? requested : '/admin';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.auth.login(this.form.value.identifier, this.form.value.password).subscribe({
      next: () => {
        this.submitting = false;

        if (!this.auth.isAdmin()) {
          this.auth.logout();
          this.errorMessage = 'This account does not have admin access.';
          return;
        }

        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'Invalid email/username or password.';
        console.error(err);
      }
    });
  }
}
