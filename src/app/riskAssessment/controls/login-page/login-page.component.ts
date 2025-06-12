import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { presentToast, Utility } from 'src/shared/utility';
import { __await } from 'tslib';
import { firstValueFrom } from 'rxjs';
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
  private hasFetchedLogins: boolean = false; // Track if logins have been fetched

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
    if (!this.hasFetchedLogins) {
      this.getUserLogins();
      this.hasFetchedLogins = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasFetchedLogins) {
      this.loginForm.reset();
      this.getUserLogins();
      this.hasFetchedLogins = true;
    }
  }


private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
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

    const updatePayload = {
      Username: username
    };
    this.apiService.forgetPassword(updatePayload).subscribe({
      next: async (res: any) => {
        await this.showToast(res.message || 'Reset email sent, please check your inbox.', 3000, 'top');
        this.loginForm.patchValue({ password: '' });
        this.loginForm.get('password')?.setErrors(null);
      },
      error: async (err: any) => {
        await this.showToast(err.error.error.message, 3000, 'top');
        this.loginForm.patchValue({ password: '' });
        this.loginForm.get('password')?.setErrors(null);
      },
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
      await this.handleSuccessfulLogin(username, user);

  try {
    let url = sessionStorage.getItem('redirectUrl');
    if(sessionStorage.getItem('redirectUrl') && url?.includes('code')) {
      this.router.navigateByUrl(url || '');
      sessionStorage.removeItem('redirectUrl');
    } else {
      await this.router.navigate(['/riskassessment']);
    }
    await presentToast(this.toastController, 'Login successful!', 3000, 'top');
  } catch (err) {
    await presentToast(this.toastController, 'Navigation failed', 3000, 'top');
    console.error('Navigation error:', err);
  }
}
  private async handleSuccessfulLogin(username: string, user: any) {
    // Safely encode Unicode strings for btoa
    const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
    const encodedUsername = toBase64(username);
    const encodedUser = toBase64(JSON.stringify(user));
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
