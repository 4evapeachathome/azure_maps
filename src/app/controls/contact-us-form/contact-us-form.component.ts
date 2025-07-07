import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ApiService } from 'src/app/services/api.service';
import { LoggingService } from 'src/app/services/logging.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { getConstant } from 'src/shared/constants';
import { APIEndpoints } from 'src/shared/endpoints';
import { presentToast, validateEmail } from 'src/shared/utility';

@Component({
  selector: 'pathome-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule, NgxCaptchaModule, RouterModule]
})
export class ContactUsFormComponent  implements OnInit {
  @ViewChild('contactForm') ContactForm!: NgForm;
  @ViewChild('recaptcha', { static: true }) recaptchaElement!: ElementRef;
  isCaptchaVerified: boolean = false;
  captchaToken: string = '';
  widgetId: number = -1;
  feedbackEmail: string = '';
  contactForm: any;
  formData = {
    name: '',
    email: '',
    feedback: '',
  };
  @Output() loaded = new EventEmitter<void>();
  device:any;
  @Output() showloadeder = new EventEmitter<void>();
 

  constructor(private apiService: ApiService,
    private toastController: ToastController,
    private loggingService: LoggingService,
    private deviceService:DeviceDetectorService,
    private ngZone: NgZone,
    private analytics:PageTitleService) { 
    this.device = this.deviceService.getDeviceInfo(); 
    }

  ngOnInit() {
    this.renderReCaptcha();
  }

async onSubmit() {
  if (this.validateForm()) {
    if (!this.isCaptchaVerified || !this.captchaToken) {
      const msg = 'Captcha verification failed';
      this.onClear();
      this.ContactForm.resetForm();
      return;
    }

    this.showloadeder.emit();
    this.formData = {
      name: this.formData?.name?.trim(),
      email: this.formData?.email?.trim(),
      feedback: this.formData?.feedback?.trim()
    };

    this.apiService.sendContactData(this.formData).subscribe({
      next: async (response) => {
        if (response?.data?.id) {
          this.analytics.trackFormSubmit('ContactUs');
          const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
          await presentToast(this.toastController, successMessage);
          this.onClear();
          this.ContactForm.resetForm();
          this.resetCaptcha();
          this.loaded.emit();
        } else {
          const msg = 'Invalid response format - missing ID';
          console.error(msg);

          this.loggingService.handleApiErrorEducationModule(
            'Invalid contact submission response',
            'onSubmit',
            APIEndpoints.contactus,
            '',
            msg,
            422,
            this.device
          );

          const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
          await presentToast(this.toastController, errorMessage);
          this.loaded.emit();
        }
      },
      error: async (error) => {
        console.error('Error sending contact data', error);

        this.loggingService.handleApiErrorEducationModule(
          'Failed to submit contact form',
          'onSubmit',
          APIEndpoints.contactus,
          '',
          error?.error?.error?.message || error?.message || 'Unknown error',
          error?.status || 500,
          this.device
        );

        const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
        await presentToast(this.toastController, errorMessage);
        this.loaded.emit();
      }
    });
  } else {
    const msg = 'Form validation failed';
    console.error(msg);

    this.loggingService.handleApiErrorEducationModule(
      'Form validation failed before submission',
      'onSubmit',
      'FormValidation',
      '',
      msg,
      400,
      this.device
    );

    this.loaded.emit();
  }
}




  validateForm(): boolean {
    return (
      this.formData.name.length >= 3 &&
      validateEmail(this.formData.email) &&
      this.formData.feedback.length >= 3
    );
  }

  onClear() {
    this.formData = {
      name: '',
      email: '',
      feedback: ''
    };
    this.resetCaptcha();
  }

  //Captcha
 renderReCaptcha() {
  try {
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
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
      // If grecaptcha is not yet available, try again after delay
      setTimeout(() => this.renderReCaptcha(), 500);

      this.loggingService.handleApiErrorEducationModule(
        'reCAPTCHA not available on window object',
        'renderReCaptcha',
        'grecaptcha.render',
        '',
        'grecaptcha not defined when attempting to render captcha',
        503,
        this.device
      );
    }
  } catch (err: any) {
    console.error('Error while rendering reCAPTCHA:', err);
    this.loggingService.handleApiErrorEducationModule(
      'Failed to render reCAPTCHA',
      'renderReCaptcha',
      'grecaptcha.render',
      '',
      err?.message || 'Unknown error while rendering captcha',
      500,
      this.device
    );
  }
}
  isFormEmpty(): boolean {
    const isFormDataEmpty = (
      !this.formData?.name?.trim() &&
      !this.formData?.email?.trim() &&
      !this.formData?.feedback?.trim()
    );
    return isFormDataEmpty && !this.isCaptchaVerified;
  }

  resetCaptcha() {
    this.isCaptchaVerified = false;
    this.captchaToken = '';
    if (typeof window !== 'undefined' && (window as any).grecaptcha && this.widgetId !== -1) {
      (window as any).grecaptcha.reset(this.widgetId);
    }
  }

}
