import { Component, OnInit, ElementRef, ViewChild, NgZone } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  @ViewChild('recaptcha', { static: true }) recaptchaElement!: ElementRef;
  isCaptchaVerified: boolean = false;
  captchaToken: string = '';
  widgetId: number = -1;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    this.renderReCaptcha();
  }

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

  async onSubmit() {
    if (this.isCaptchaVerified && this.captchaToken) {
      console.log('Form submitted with captcha token:', this.captchaToken);
      // Here you would send the token to your backend for verification
      
      // Reset the captcha after submission
      this.resetCaptcha();
    } else {
      console.error('Please complete the captcha first');
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
