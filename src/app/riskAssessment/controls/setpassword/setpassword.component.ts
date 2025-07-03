import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { DeviceDetectorService } from 'ngx-device-detector';
import { filter } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { APIEndpoints } from 'src/shared/endpoints';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'app-setpassword',
  templateUrl: './setpassword.component.html',
  styleUrls: ['./setpassword.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class SetPasswordComponent implements OnInit {
  userForm: FormGroup;
  showPassword = false;
  showNewPassword = false;
  userLogins: any[] = [];
  flowType: any | null = null;
  @Input() reloadFlag: boolean = false;
   @ViewChild('recaptcha', { static: true }) recaptchaElement!: ElementRef;
    isCaptchaVerified: boolean = false;
    captchaToken: string = '';
    widgetId: number = -1;
    private hasFetchedLogins: boolean = false;
     @Output() startloader = new EventEmitter<void>();
      @Output() stoploader = new EventEmitter<Error>();
  device:any;
  resolvedData: any;
  previousUrl: string = '';
  currentUrl: string = '';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private ngZone: NgZone,
    private route: ActivatedRoute,
  private deviceService: DeviceDetectorService,
  private loggingService: LoggingService,
    private toastController: ToastController,
  ) {
    this.device = this.deviceService.getDeviceInfo();
    this.userForm = this.fb.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.matchPasswordsValidator,
      }
    );
  }

  ngOnInit() {
    if (!this.hasFetchedLogins) {
      this.resetFormAndFetchUsers();
      this.renderReCaptcha();
      this.hasFetchedLogins = true;
      // this.flowType = this.route.snapshot.queryParamMap.get('flow');
    }
    this.flowType = this.route.snapshot.data['flowType'].flowType || null;
    // remove query param from url once we get this.flowType
    if (this.flowType !== null) {
      sessionStorage.setItem('flowType', this.flowType);
      this.router.navigate([], {
        queryParams: { flow: null },
        queryParamsHandling: 'merge',
      });
    } else {
      this.flowType = sessionStorage.getItem('flowType');
    }
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['reloadFlag'] && changes['reloadFlag'].currentValue === true && !this.hasFetchedLogins) {
      this.resetFormAndFetchUsers();
      this.renderReCaptcha();
      this.hasFetchedLogins = true;
      this.flowType = this.route.snapshot.queryParamMap.get('flow');

    }
  }

  private resetFormAndFetchUsers() {
    this.userForm.reset();
    //this.getUserLogins();
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

 renderReCaptcha() {
  try {
    if (
      typeof window !== 'undefined' &&
      (window as any).grecaptcha &&
      typeof (window as any).grecaptcha.render === 'function'
    ) {
      this.widgetId = (window as any).grecaptcha.render(this.recaptchaElement?.nativeElement, {
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
      // Retry if grecaptcha not yet ready
      setTimeout(() => this.renderReCaptcha(), 500);
    }
  } catch (err: any) {
    console.error('Error in renderReCaptcha:', err);

    this.loggingService.handleApiError(
      'Failed to render reCAPTCHA on Setpassword',                // activityType
      'renderReCaptcha',                           // errorFunction
      '',                                          // No API URL involved
      '',    // requestParams
      err?.message || 'Unknown error',             // errorMessage
      0,                                           // errorStatus
      this.device                                  // device info
    );
  }
}

  // getUserLogins() {
  //   this.apiService.getUserLogins().subscribe({
  //     next: (data: any) => {
  //       this.userLogins = data || [];
  //     },
  //     error: (error: any) => {
  //       console.error('Failed to fetch user logins', error);
  //       this.showToast('Failed to fetch user logins.', 3000, 'top');
  //     },
  //   });
  // }

  matchPasswordsValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
  const newPassword = formGroup.get('newPassword')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  
  if (password === newPassword) {
    return { samePassword: true };
  }
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      await this.showToast('Please fill all required fields correctly.', 3000, 'top');
      return;
    }
    if (!this.isCaptchaVerified || !this.captchaToken) {
      console.error('Please complete the captcha first');
      this.userForm.reset();
      this.resetCaptcha();
      return;
    }

    if (this.flowType === 'onboarding' || this.flowType === 'forgotpassword') {
      this.startloader.emit();
      await this.handlePasswordUpdate();
    }
  }
  // private async handlePasswordUpdate() {
  //   const { username, password, newPassword } = this.userForm.value;
    
  //   const updatePayload = {
  //     Username: username,
  //     password: newPassword,
  //     temp_password: password
  //   };
  //   this.apiService.updateUserLogin(updatePayload).subscribe({
  //     next: async (res: any) => {
  //       await this.showToast(res?.message, 2500, 'top');
  //       this.hasFetchedLogins = false;
  //       this.router.navigate(['/login']);
  //       this.userForm.reset();
  //       this.resetCaptcha();
  //     },
  //     error: async (err: any) => {
  //       await this.showToast(err.error.error.message, 3000, 'top');
  //       this.userForm.reset();
  //       this.resetCaptcha();
  //     },
  //   });
  // }

private async handlePasswordUpdate() {
  const { username, password, newPassword } = this.userForm.value;
  const processedUsername = username?.trim().toLowerCase();
  const newPass = newPassword?.trim();
  const tempPass = password?.trim();

  if (!processedUsername || !tempPass || !newPass) {
    await this.showToast('All fields are required', 3000, 'top');
    this.stoploader.emit();
    return;
  }

  this.apiService.changePassword(processedUsername, tempPass, newPass).subscribe({
    next: async (res: any) => {
      await this.showToast(res?.message || 'Password updated successfully', 2500, 'top');
      this.hasFetchedLogins = false;
      this.stoploader.emit();
      this.router.navigate(['/login']);
      this.userForm.reset();
      this.resetCaptcha();
    },
    error: async (err: any) => {
      this.stoploader.emit();

      const message =
        err?.error?.message ||
        err?.error?.error?.message ||
        err?.message ||
        'Failed to update password';

      console.error('Error in handlePasswordUpdate:', err);

      this.loggingService.handleApiError(
        'Failed to update password for' + this.flowType,                  // activityType
        'handlePasswordUpdate',                       // errorFunction
        APIEndpoints.changePassword || '',            // request URL (if defined)
        '',                            // requestParams (username)
        message,                                      // errorMessage
        err?.status || 0,                             // errorStatus
        this.device                                   // device info
      );

      await this.showToast(message, 3000, 'top');
      this.resetCaptcha();
    },
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
