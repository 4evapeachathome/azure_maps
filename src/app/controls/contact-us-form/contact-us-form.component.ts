import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { NgxCaptchaModule } from 'ngx-captcha';
import { filter, firstValueFrom, take } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { getConstant } from 'src/shared/constants';
import { MenuService } from 'src/shared/menu.service';
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
  @Output() showloadeder = new EventEmitter<void>();
 

  constructor(private sharedDataService:MenuService,private apiService: ApiService,private toastController: ToastController,private ngZone: NgZone,private analytics:PageTitleService) { }

 async ngOnInit() {
    this.sharedDataService.dataLoaded$.pipe(
  filter(ready => ready),
  take(1) // Only the first true value
).subscribe(() => {
  this.renderReCaptcha(); // Run only when config is ready
});
  }


  async onSubmit() {
    // Emit showloader event before submission
    if (this.validateForm()) {
      if (!this.isCaptchaVerified || !this.captchaToken) {
        console.error('Please complete the captcha first');
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
          
          // Check if response contains data and id
          if (response?.data?.id) {
            this.analytics.trackFormSubmit('ContactUs');
            const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
            await presentToast(this.toastController, successMessage);
            this.onClear();
            this.ContactForm.resetForm();
            this.resetCaptcha();
            this.loaded.emit(); // Emit loaded event after successful submission
            
          } else {
            console.error('Invalid response format - missing ID');
            const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
            await presentToast(this.toastController, errorMessage);
            this.loaded.emit();
          }
        },
        error: async (error) => {
          console.error('Error sending contact data', error);
          const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
          await presentToast(this.toastController, errorMessage);
          this.loaded.emit();
        }
      });
    } else {
      console.error('Form validation failed');
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
 async renderReCaptcha(retryCount = 0) {
  const configMap = await firstValueFrom(this.sharedDataService.config$);
  const captchaKey = configMap['googleCaptchaAPIKey']; // or 'sessionTimeoutValue'

  if (!captchaKey || typeof window === 'undefined' || !(window as any).grecaptcha || !(window as any).grecaptcha.render) {
    if (retryCount < 10) {
      setTimeout(() => this.renderReCaptcha(retryCount + 1), 500); // Wait and retry
    } else {
      console.error("reCAPTCHA failed to load after 10 attempts.");
    }
    return;
  }

  this.widgetId = (window as any).grecaptcha.render(this.recaptchaElement.nativeElement, {
    sitekey: captchaKey,
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
  if ((window as any).grecaptcha && this.widgetId !== -1) {
    (window as any).grecaptcha.reset(this.widgetId);
    this.isCaptchaVerified = false;
    this.captchaToken = '';
  }
}


}
