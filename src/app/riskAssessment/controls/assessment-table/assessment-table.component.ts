import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { IonRow } from "@ionic/angular/standalone";
import { ApiService } from 'src/app/services/api.service';
import { presentToast } from 'src/shared/utility';

@Component({
  selector: 'app-assessment-table',
  templateUrl: './assessment-table.component.html',
  styleUrls: ['./assessment-table.component.scss'],
  imports: [CommonModule, IonicModule]
})
export class AssessmentTableComponent  implements OnInit {
  responseJson: any;

  @Input() selectedAssessment: any;
  ratAssessmentResultList: any = [];
  assessmentNumber: string = '';
  ratAssessmentResult: any;

  constructor(private activatedRoute: ActivatedRoute,private apiService: ApiService, private toastController: ToastController) { }

  ngOnInit() {
    // this.selectedAssessment = sessionStorage.getItem('selectedAssessment') || null;
    this.assessmentNumber = this.activatedRoute.snapshot.queryParamMap.get('code') || '';

    if(this.activatedRoute.snapshot.queryParamMap.get('code')) {
      this.assessmentNumber = this.activatedRoute.snapshot.queryParamMap.get('code') || '';
    } else {
      let ratResult = sessionStorage.getItem('ratsAssessmentResult');
      if(ratResult) {
        this.ratAssessmentResult = JSON.parse(ratResult || '');
        this.assessmentNumber = this.ratAssessmentResult.asssessmentNumber;
      }
    }
   
    this.checkSelectedAssessment(this.assessmentNumber);
  }

  checkSelectedAssessment(code: string) {
    if (code && code.toLowerCase().includes('web-')) {
      this.fetchWebResults(code);
    } else if(code && code.toLowerCase().includes('hit-')) {
    } else if(code && code.toLowerCase().includes('da-')) {
    } else if(code && code.toLowerCase().includes('dai-')) {
    } else if(code && code.toLowerCase().includes('cts-')) {
    } else if(code && code.toLowerCase().includes('ssripa-')) {
    } else {
      this.selectedAssessment = '';
    }
  }

  fetchWebResults(code: string) {
    this.apiService.getRatsResult(code).subscribe({
      next: (response: any) => {
        if (response) {
          this.responseJson = response.assessmentSummary;
          this.showToast(response?.message || 'Assessment summary fetch successfully.', 3000, 'top');
        }
      },
      error: (error: any) => {
        const errorMsg = error?.error?.message || error?.message || 'Failed to fetch assessment result';
        this.showToast(errorMsg, 3000, 'top');
      }
    })
  }

  private async showToast(message: string, duration = 2500, position: 'top' | 'bottom' | 'middle' = 'top') {
    await presentToast(this.toastController, message, duration, position);
  }

}
