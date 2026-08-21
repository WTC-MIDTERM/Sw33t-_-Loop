import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/auth';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('passwordConfirmation')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  submitting = false;
  errorMessage = '';
  success = false;
  code = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirmation: ['', Validators.required]
      },
      { validators: passwordsMatch }
    );
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.queryParamMap.get('code') || '';
    if (!this.code) {
      this.errorMessage = 'This reset link is missing or invalid. Please request a new one.';
    }
  }

  onSubmit(): void {
    if (!this.code) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const { password, passwordConfirmation } = this.form.value;

    this.auth.resetPassword(this.code, password, passwordConfirmation).subscribe({
      next: () => {
        this.submitting = false;
        this.success = true;
        setTimeout(() => this.router.navigate(['/']), 1500);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = 'This reset link is invalid or has expired. Please request a new one.';
        console.error(err);
      }
    });
  }
}