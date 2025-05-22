import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, IonicModule } from '@ionic/angular';
import { CookieService } from 'ngx-cookie-service';
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
  hitsQuestions = [
    { text: 'Physically hurt you', selected: null },
    { text: 'Insult or talk down to you', selected: null },
    { text: 'Threaten you with harm', selected: null },
    { text: 'Scream or curse at you', selected: null }
  ];

  constructor(
    private router: Router,
    private cookieService: CookieService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails'); // Or 'username'
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
        this.loaded = true;
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('user');
        this.router.navigate(['/loginPage']);
      }
    } else {
      this.router.navigate(['/loginPage']);
    }
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
