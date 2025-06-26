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
  private totalComponents = 1; // Number of child components with API calls
  private loadedComponents = 0;
  private loaderDismissed = false;

  constructor(private loadingController: LoadingController) { }


  async ngOnInit() {

  }

  async initiateLoader(){
    await this.showLoader();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.loaderDismissed) {
        this.hideLoader();
      } else {
      }
    }, 10000); // 10 seconds max
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
    if (this.loading && !this.loaderDismissed) {
      try {
        await this.loading.dismiss();
      } catch (e) {
      }
      this.loaderDismissed = true;
      this.loading = null;
    }
  }

 async onChildLoaded() {
  if (this.loaderDismissed) {
    return;
  }

  this.loadedComponents++;


  if (this.loadedComponents >= this.totalComponents) {
    await this.hideLoader(); // <- important
  }}

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
