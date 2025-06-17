import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, NgZone, OnInit, SimpleChanges, ViewChild } from '@angular/core';
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
  @ViewChild('recaptcha', { static: true }) recaptchaElement!: ElementRef;
  isCaptchaVerified: boolean = false;
  captchaToken: string = '';
  widgetId: number = -1;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private cookieService: CookieService,
    private router: Router,
    private toastController: ToastController,
    private ngZone: NgZone
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
      //this.getUserLogins();
      this.renderReCaptcha();
      this.hasFetchedLogins = true;
    }
  }

  renderReCaptcha() {
    if (typeof window !== 'undefined' && !(window as any).grecaptcha) {
      // Load the reCAPTCHA script if not already loaded
      const scriptId = 'recaptcha-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => this.renderReCaptcha();
        document.body.appendChild(script);
      } else {
        // Wait for the script to load
        setTimeout(() => this.renderReCaptcha(), 500);
      }
      return;
    }
    if ((window as any).grecaptcha && typeof (window as any).grecaptcha.render === 'function') {
    //  if (typeof window !== 'undefined' && (window as any).grecaptcha) {  
      this.widgetId = (window as any).grecaptcha.render(this.recaptchaElement.nativeElement, {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        callback: (response: string) => {
          this.ngZone.run(() => {
            this.captchaToken = response;
            this.isCaptchaVerified = true;
          });
        },
        'expired-callback': () => {
          this.ngZone.run(() => {
            this.isCaptchaVerified = false;
            this.captchaToken = '';
          });
        }
      });
    } else {
      // If grecaptcha is not available or not ready, try again in 500ms
      setTimeout(() => this.renderReCaptcha(), 500);
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasFetchedLogins) {
      this.loginForm.reset();
      //this.getUserLogins();
      this.renderReCaptcha();
      this.hasFetchedLogins = true;
    }
  }


private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

  // getUserLogins() {
  //   this.apiService.getUserLogins().subscribe({
  //     next: (data: any) => {
  //       this.userLogins = data || [];
  //      // debugger;
  //     },
  //     error: (error: any) => {
  //       console.error('Failed to fetch user logins', error);
  //     }
  //   });
  // }


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
  
//   async onSubmit() {
//     if (this.loginForm.invalid) {
//       this.loginForm.markAllAsTouched();
//       return;
//     }
//     if (!this.isCaptchaVerified || !this.captchaToken) {
//       console.error('Please complete the captcha first');
//       this.loginForm.reset();
//       this.resetCaptcha();
//       return;
//     }

//     const { username, password } = this.loginForm.value;
//     const user = this.userLogins.find(u => u.username?.toLowerCase() === username.trim()?.toLowerCase());
  
//     if (!user) {
//       this.loginForm.get('username')?.setErrors({ userNotFound: true });
//       return;
//     }
  
//     if (user.password !== password) {
//       this.loginForm.get('password')?.setErrors({ incorrectPassword: true });
//       return;
//     }
//       await this.handleSuccessfulLogin(username, user);

//   try {
//     let url = sessionStorage.getItem('redirectUrl');
//     if(sessionStorage.getItem('redirectUrl') && url?.includes('code')) {
//       this.hasFetchedLogins = false;
//       this.router.navigateByUrl(url || '');
//       sessionStorage.removeItem('redirectUrl');
//     } else {
//       this.hasFetchedLogins = false;
//       await this.router.navigate(['/riskassessment']);
//     }
//     await presentToast(this.toastController, 'Login successful!', 3000, 'top');
//   } catch (err) {
//     await presentToast(this.toastController, 'Navigation failed', 3000, 'top');
//     console.error('Navigation error:', err);
//   }
// }
async onSubmit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  if (!this.isCaptchaVerified || !this.captchaToken) {
    console.error('Please complete the captcha first');
    this.loginForm.reset();
    this.resetCaptcha();
    return;
  }

  const { username, password } = this.loginForm.value;
  const processedUsername = username?.trim()?.toLowerCase();

  try {
    const user = await this.apiService.login(processedUsername, password).toPromise();

    await this.handleSuccessfulLogin(user.username, user);

    let url = sessionStorage.getItem('redirectUrl');
    if (url?.includes('code')) {
      this.hasFetchedLogins = false;
      this.router.navigateByUrl(url);
      sessionStorage.removeItem('redirectUrl');
    } else {
      this.hasFetchedLogins = false;
      await this.router.navigate(['/riskassessment']);
    }

    await presentToast(this.toastController, 'Login successful!', 3000, 'top');
  } catch (error: any) {
    console.error('Login failed:', error);
  
    if (error?.message) {
      await presentToast(this.toastController, error.message, 3000, 'top');
    } else {
      await presentToast(this.toastController, 'Login failed', 3000, 'top');
    }
  }
}

  private async handleSuccessfulLogin(username: string, user: any) {
    // Safely encode Unicode strings for btoa
    const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));
    const encodedUsername = toBase64(username);
    const encodedUser = toBase64(JSON.stringify(user));
    const loginTimestamp = Date.now().toString();
    this.loginForm.reset();
    this.resetCaptcha();
  
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

  resetCaptcha() {
    this.isCaptchaVerified = false;
    this.captchaToken = '';
    if (typeof window !== 'undefined' && (window as any).grecaptcha && this.widgetId !== -1) {
      (window as any).grecaptcha.reset(this.widgetId);
    }
  }

}
