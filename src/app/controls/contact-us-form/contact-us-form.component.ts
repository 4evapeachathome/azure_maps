import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ApiService } from 'src/app/services/api.service';
import { getConstant } from 'src/shared/constants';
import { presentToast, validateEmail } from 'src/shared/utility';

@Component({
  selector: 'pathome-contact-us-form',
  templateUrl: './contact-us-form.component.html',
  styleUrls: ['./contact-us-form.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule,FormsModule, NgxCaptchaModule]
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

 

  constructor(private apiService: ApiService,private toastController: ToastController,private ngZone: NgZone) { }

  ngOnInit() {
    this.renderReCaptcha();
  }


  async onSubmit() {
    if (this.validateForm()) {
      if (this.isCaptchaVerified && this.captchaToken) {
        console.log('Form submitted with captcha token:', this.captchaToken);
        this.resetCaptcha();
        this.onClear();
        this.ContactForm.resetForm();
      } else {
        console.error('Please complete the captcha first');
        this.onClear();
        this.ContactForm.resetForm();
      }
      this.apiService.sendContactData(this.formData).subscribe(
        async response => {
          console.log('Contact data sent successfully', response);
          const successMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_SUCCESS');
          await presentToast(this.toastController, successMessage);
          this.onClear();
          this.ContactForm.resetForm();
        },
        async error => {
          console.error('Error sending contact data', error);
          const errorMessage = getConstant('TOAST_MESSAGES', 'FORM_SUBMITTED_ERROR');
          await presentToast(this.toastController, errorMessage);
        }
      );
    } else {
      console.error('Form validation failed');
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
  }

  //Captcha
  renderReCaptcha() {
    if (typeof window !== 'undefined' && (window as any).grecaptcha) {
      this.widgetId = (window as any).grecaptcha.render(this.recaptchaElement.nativeElement, {
        sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        callback: (response: string) => {
          this.ngZone.run(() => {
            this.captchaToken = response;
            this.isCaptchaVerified = true;
            console.log('Captcha verified with token:', response);
          });
        },
        'expired-callback': () => {
          this.ngZone.run(() => {
            this.isCaptchaVerified = false;
            this.captchaToken = '';
            console.log('Captcha expired');
          });
        }
      });
    } else {
      // If grecaptcha is not available, try again in 500ms
      setTimeout(() => this.renderReCaptcha(), 500);
    }
  }

  resetCaptcha() {
    this.isCaptchaVerified = false;
    this.captchaToken = '';
    if (typeof window !== 'undefined' && (window as any).grecaptcha && this.widgetId !== -1) {
      (window as any).grecaptcha.reset(this.widgetId);
    }
  }

}
