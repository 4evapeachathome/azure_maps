import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
 

  constructor(private apiService: ApiService,private toastController: ToastController,private ngZone: NgZone) { }

  ngOnInit() {
    this.renderReCaptcha();
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
  renderReCaptcha() {
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
      // If grecaptcha is not available, try again in 500ms
      setTimeout(() => this.renderReCaptcha(), 500);
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
