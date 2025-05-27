import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { MenuService } from 'src/shared/menu.service';
import { presentToast, Utility } from 'src/shared/utility';

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
  showNewPasswordField = false;
  showPassword = false;
  showNewPassword = false;
  @Input() reloadFlag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cookieService: CookieService,
    private router: Router,
    private toastController: ToastController
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Fetch user logins on component initialization 
    this.loginForm.reset();
    this.getUserLogins();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true) {
      this.loginForm.reset();
      this.getUserLogins()  // Call your API or logic
    }
  }

  getUserLogins() {
    this.apiService.getUserLogins().subscribe({
      next: (data: any) => {
        this.userLogins = data || [];
       // debugger;
      },
      error: (error: any) => {
        console.error('Failed to fetch user logins', error);
      }
    });
  }



  onForgotPassword(event: Event) {
    event.preventDefault(); // prevent link behavior
    const rawUsername = this.loginForm.get('username')?.value || '';
    const username = rawUsername.trim().toLowerCase();
    if (!username) {
      alert('Please enter your username first.');
      return;
    }
    fetch(APIEndpoints.forgetPw, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || 'Reset email sent, please check your inbox.');
        this.loginForm.patchValue({ password: '' });
        this.loginForm.get('password')?.setErrors(null);
      })
      .catch(() => {
        alert('Failed to send reset email');
        this.loginForm.patchValue({ password: '' });
        this.loginForm.get('password')?.setErrors(null);
      });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.loginForm.value;
    const user = this.userLogins.find(u => u.username?.toLowerCase() === username.trim()?.toLowerCase());
  
    if (!user) {
      this.loginForm.get('username')?.setErrors({ userNotFound: true });
      return;
    }
  
    if (user.password !== password) {
      this.loginForm.get('password')?.setErrors({ incorrectPassword: true });
      return;
    }

      const updatePayload = {
        IsPasswordChanged: true,
      };
  
      this.apiService.updateUserLogin(user.id, updatePayload).subscribe({
        next: async () => {
          await this.handleSuccessfulLogin(username, user);
          await presentToast(this.toastController, 'Successfully Logged In!', 2500, 'top');
          this.router.navigate(['/riskassessment']);
          this.loginForm.reset();
        },
        error: async err => {
          console.error('Failed to update user login', err);
          await presentToast(this.toastController, 'Failed to login. Please try again.', 3000, 'top');
        }
      });
  }
  
  private async handleSuccessfulLogin(username: string, user: any) {
    const encodedUsername = btoa(username);
    const encodedUser = btoa(JSON.stringify(user));
    const loginTimestamp = Date.now().toString();
  
    this.cookieService.set('userdetails', encodedUser, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
    });
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
  }

}
