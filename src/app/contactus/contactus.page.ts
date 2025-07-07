import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';
import { LoadingController } from '@ionic/angular';
import { MenuService } from 'src/shared/menu.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-contactus',
  templateUrl: './contactus.page.html',
  styleUrls: ['./contactus.page.scss'],
  standalone: false
})
export class ContactusPage implements OnInit,AfterViewInit {
  @ViewChild(ContactUsFormComponent) contactUs!: ContactUsFormComponent;
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild('smContainerRef') smContainerRef!: ElementRef;


  constructor(private loadingController: LoadingController, private menuService:MenuService) { }


   async ngOnInit() {
        // Set up navigation event subscription
        this.showLoader();
      }    

 ngAfterViewInit(): void {

  setTimeout(() => {
    const height = this.smContainerRef?.nativeElement?.offsetHeight || 0;
    this.menuService.setContentHeight(height);
  },0);

  this.menuService.menuLoaded$
    .pipe(
      filter((loaded) => loaded),
      take(1) // Only react to the first true value
    )
    .subscribe(() => {
      this.hideLoader();
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
    }, 3000);
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
