import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
   standalone: true,
    imports: [CommonModule, IonicModule,ReactiveFormsModule],
})
export class LoginPageComponent  implements OnInit {
  loginForm: FormGroup;
  userLogins: any[] = [];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Fetch user logins on component initialization
    this.apiService.getUserLogins().subscribe({
      next: (data: any) => {
        this.userLogins = data || [];
      },
      error: (error: any) => {
        console.error('Failed to fetch user logins', error);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;

    // Check if username exists
    const user = this.userLogins.find(u => u.username === username);
    if (!user) {
      this.loginForm.get('username')?.setErrors({ userNotFound: true });
      return;
    }

    // Check if password matches
    if (user.password !== password) {
      this.loginForm.get('password')?.setErrors({ incorrectPassword: true });
      return;
    }

    // Successful login - navigate to the next page (e.g., dashboard)
    this.router.navigate(['/dashboard']);
  }

}
