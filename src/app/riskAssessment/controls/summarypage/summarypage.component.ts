import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RiskMeterComponent } from '../../risk-meter/risk-meter.component';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-summarypage',
  templateUrl: './summarypage.component.html',
  styleUrls: ['./summarypage.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RiskMeterComponent]
})
export class SummarypageComponent implements OnInit {
  loggedInUser: any = null;
  riskScore: number = 8;
  loaded: boolean = false;

  constructor(
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit() {
    const encodedUser = this.cookieService.get('userdetails');
    if (encodedUser) {
      try {
        this.loggedInUser = JSON.parse(atob(encodedUser));
      } catch {
        console.error('Invalid cookie format, logging out...');
        this.cookieService.delete('userdetails');
        this.router.navigate(['/login']);
        return;
      }
    }

    // Get risk score from session storage
    const resultStr = sessionStorage.getItem('hitsAssessmentResult');
    if (resultStr) {
      try {
        const result = JSON.parse(resultStr);
        this.riskScore = result.total || 0;
      } catch {
        console.error('Invalid assessment result format');
      }
    }

    this.loaded = true;
  }

  logout() {
    this.cookieService.delete('userdetails');
    this.router.navigate(['/login']);
  }
}
