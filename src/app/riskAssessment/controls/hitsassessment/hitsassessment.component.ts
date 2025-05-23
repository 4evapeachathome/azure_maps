import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from 'src/app/services/api.service';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-hitsassessment',
  templateUrl: './hitsassessment.component.html',
  styleUrls: ['./hitsassessment.component.scss'],
    standalone: true,
          imports: [CommonModule, IonicModule, FormsModule]
})
export class HitsassessmentComponent  implements OnInit {
  loggedInUser: any = null;
  caseNumber: string = '';
  loaded: boolean = false;
  hitsQuestions: any[] = [];
  scaleOptions: string[] = [];

  constructor(
    private router: Router,
    private apiService: ApiService,
    private menuService: MenuService,
    private cookieService: CookieService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails');
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('userdetails');
        this.router.navigate(['/loginPage']);
        return;
      }
    } else {
      this.router.navigate(['/loginPage']);
      return;
    }
  
    const cachedHits = this.menuService.getHitsAssessment();
    if (cachedHits && cachedHits.length > 0) {
      this.setupHitsQuestions(cachedHits);
    } else {
      // Load from API if cache is empty
      this.apiService.getHitsAssessmentQuestions().subscribe({
        next: (hitsData: any) => {
          hitsData.forEach((q: any) => {
            q.multiple_answer_option.sort((a: any, b: any) => a.score - b.score);
          });
          this.menuService.setHitsAssessment(hitsData);
          this.setupHitsQuestions(hitsData);
        },
        error: (err:any) => {
          console.error('Failed to load HITS data from API:', err);
        }
      });
    }
  }

  setupHitsQuestions(hitsData: any[]) {
    const scaleSet = new Set<string>();
    hitsData[0].multiple_answer_option.forEach((opt: any) => {
      scaleSet.add(`${opt.score}. ${opt.label}`);
    });
  
    this.scaleOptions = [...scaleSet];
    this.hitsQuestions = hitsData.map((q: any) => ({
      id: q.id,
      text: q.question_text,
      selected: null,
      weight_critical_alert: q.weight_critical_alert,
      options: q.multiple_answer_option.map((opt: any) => ({
        score: opt.score,
        label: opt.label
      }))
    }));
  
    this.loaded = true;
  }
  

  submit() {  
      this.router.navigate(['/riskassessmentresult']);
  }

  goBack() {
    this.router.navigate(['/riskassessment']);
    this.caseNumber = '';
  }

  stayLoggedIn() {
    const now = Date.now().toString();
    this.cookieService.set('loginTime', now, {
      path: '/',
      sameSite: 'Strict',
      secure: true,
    });
  }


  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: () => {
            this.cookieService.delete('username');
            this.cookieService.delete('loginTime');
            this.cookieService.delete('userdetails');
            this.router.navigate(['/loginPage']);
          }
        }
      ]
    });
  
    await alert.present();
  }

}
