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
        console.log('Fallback timeout triggered: dismissing loader');
        this.hideLoader();
      } else {
        console.log('Fallback timeout ignored: loader already dismissed');
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
    console.log('Loader presented');
  }

  async hideLoader() {
    if (this.loading && !this.loaderDismissed) {
      try {
        await this.loading.dismiss();
        console.log('Loader dismissed');
      } catch (e) {
        console.warn('Loader already dismissed or error dismissing:', e);
      }
      this.loaderDismissed = true;
      this.loading = null;
    }
  }

 async onChildLoaded() {
  if (this.loaderDismissed) {
    console.log(`Ignoring extra load event after loader dismissed`);
    return;
  }

  this.loadedComponents++;

  console.log(`Component loaded (${this.loadedComponents}/${this.totalComponents})`);

  if (this.loadedComponents >= this.totalComponents) {
    console.log(`All components loaded, hiding loader...`);
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
