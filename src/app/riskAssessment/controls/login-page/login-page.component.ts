import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

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
    private cookieService: CookieService,
    private router: Router,
    private menuService:MenuService
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

  onForgotPassword(event: Event) {
    event.preventDefault(); // prevent link behavior
    const username = this.loginForm.get('username')?.value;
  
    if (!username) {
      alert('Please enter your username first.');
      return;
    }
    fetch('http://localhost:1337/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Reset email sent if username exists');
      })
      .catch(() => {
        alert('Failed to send reset email');
      });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    debugger;
    const { username, password } = this.loginForm.value;
    // Check if username exists
    const user = this.userLogins.find(u => u.email.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      console.log('Username not found:', username);
      this.loginForm.get('username')?.setErrors({ userNotFound: true });
      return;
    }

    // Check if password matches
    if (user.password !== password) {
      this.loginForm.get('password')?.setErrors({ incorrectPassword: true });
      return;
    }

    
    const encodedUsername = btoa(username);
    const encodedUser = btoa(JSON.stringify(user));
    this.cookieService.set('userdetails', encodedUser, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
      expires: 1/24, 
    });
    const loginTimestamp = Date.now().toString();

this.cookieService.set('username', encodedUsername, {
  path: '/',
  sameSite: 'Strict',
  secure: true,
});

this.cookieService.set('loginTime', loginTimestamp, {
  path: '/',
  sameSite: 'Strict',
  secure: true,
});

    // Successful login - navigate to the next page (e.g., assessment)
    this.router.navigate(['/riskassessment']);
  }

}
