import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
  standalone: false
})
export class ContactusPage implements OnInit,AfterViewInit {
  @ViewChild(ContactUsFormComponent) contactUs!: ContactUsFormComponent;
  loading: HTMLIonLoadingElement | null = null;

  constructor(private loadingController: LoadingController) { }

  async ngOnInit() {
    // Only show loader if not pre-rendered
    await this.showLoader();
  }

  async ngAfterViewInit() {
    const idleCallback = window['requestIdleCallback'] || function (cb: any) {
      setTimeout(cb, 1000);
    };

    idleCallback(() => {
      setTimeout(() => {
        this.hideLoader();
      }, 500);
    });
  }

  async showLoader() {
    this.loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      backdropDismiss: false,
    });
    await this.loading.present();

    // Force dismiss after 10 seconds just in case
    setTimeout(() => {
      this.hideLoader();
    }, 5000);
  }

  async hideLoader() {
    if (this.loading) {
      try {
        await this.loading.dismiss();
      } catch (e) {
        console.warn('Loader already dismissed or not yet created');
      }
      this.loading = null;
    }
  }

  ionViewWillEnter() {
    if (this.contactUs) {
      this.contactUs.renderReCaptcha();
    }    
}


ionViewDidLeave() {
  if (this.contactUs) {
     // Reset form data and controls on initialization
  this.contactUs.onClear();
  if (this.contactUs.ContactForm) {
    this.contactUs.ContactForm.resetForm();
  }
  }
}

}
