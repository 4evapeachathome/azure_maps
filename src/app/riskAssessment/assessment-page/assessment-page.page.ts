import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { filter, Subscription } from 'rxjs';
import { AssessmentPageComponent } from '../controls/assessment-page/assessment-page.component';

@Component({
  selector: 'app-assessment-page',
  templateUrl: './assessment-page.page.html',
  styleUrls: ['./assessment-page.page.scss'],
  standalone: false,
})
export class AssessmentPagePage implements OnInit,AfterViewInit {
  loading: HTMLIonLoadingElement | null = null;
  @ViewChild(AssessmentPageComponent) childComponent!: AssessmentPageComponent;
    reloadData: boolean = false; // Flag to trigger ngOnChanges in child component

  constructor(private loadingController: LoadingController, private router:Router) { }

   async ngOnInit() {
        // Set up navigation event subscription
        this.showLoader();
      }

      ionViewWillEnter() {
        // Toggle off first
        this.reloadData = false;
      
        // Then toggle on after a small delay to trigger ngOnChanges in the child
        setTimeout(() => {
          this.reloadData = true;
        }, 0); // Delay can be 0 or a few ms
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
}
