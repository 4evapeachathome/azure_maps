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
    // Optional: show loader early if needed
    await this.showLoader();
  }

  async ngAfterViewInit() {
    // Wait for images and components to render
    requestIdleCallback(async () => {
      // Give a slight delay to ensure child components/images are painted
      setTimeout(() => {
        this.hideLoader();
      }, 200); // adjust if needed based on image/component loading
    });
  }

  async showLoader() {
    this.loading = await this.loadingController.create({
      message: 'Loading...',
      spinner: 'crescent',
      backdropDismiss: false,
    });
    await this.loading.present();
  }

  async hideLoader() {
    if (this.loading) {
      await this.loading.dismiss();
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
