import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';
import { Utility } from 'src/shared/utility';
import { Observable } from 'rxjs';
import { PageTitleService } from 'src/app/services/page-title.service';
import { LoggingService } from 'src/app/services/logging.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { APIEndpoints } from 'src/shared/endpoints';


@Component({
  selector: 'pathome-sripacomp',
  templateUrl: './sripacomp.component.html',
  styleUrls: ['./sripacomp.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule, FormsModule],
    animations: [
      trigger('slideAnimation', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateX(100%)' }),
          animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
        ]),
        transition(':leave', [
          animate('500ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' }))
        ])
      ])
    ]
})
export class SripacompComponent  implements OnInit {
  @Output() hasYesAnswerChanged = new EventEmitter<boolean>();
  quizTitle = '';
sripa: any[] = [];
yesanswer: any[] = [];
rating = '';
currentIndex = 0;
showAnswers: boolean[] = [];
selectedOptions: string[] = [];
finalAnswerHtml: string = '';
showresults: boolean = false;
hasYesAnswer: boolean = false;
@Output() quizLoaded = new EventEmitter<void>();
@Input() ssripaGuid:any; // Track if any 'yes' answer is selected
@Output() showResultsChanged = new EventEmitter<boolean>();
device:any;

constructor(private apiService: ApiService,
  private loggingService: LoggingService,
  private deviceService: DeviceDetectorService,
   private analytics:PageTitleService) {
    this.device = this.deviceService.getDeviceInfo();
   }

ngOnInit() {
  this.loadQuiz();
}

loadQuiz(): void {
  this.apiService.getSripaa().subscribe(
    (quiz) => {
      if (quiz) {
        this.quizTitle = 'Signs of Self-Recognition in Intimate Partner Abuse - SSRIPA';
        this.sripa = quiz || [];
        this.rating = quiz.rating || '';
        this.showAnswers = new Array(this.sripa.length).fill(false);
        this.selectedOptions = new Array(this.sripa.length).fill(null);
      }
      this.quizLoaded.emit();
    },
    (error) => {
      console.error('Error loading SSRIPA quiz:', error);

      this.loggingService.handleApiErrorEducationModule(
        'Failed to load SSRIPA quiz content',
        'loadQuiz',
        APIEndpoints.ssripaQuestions, // Replace with the actual endpoint constant if needed
        '',
        error?.error?.error?.message || error?.message || 'Unknown error',
        error?.status || 500,
        this.device
      );

      this.quizLoaded.emit();
    }
  );
}




renderRichTextFromText(text: string): string {
  if (!text) return '';
  return text.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}


selectOption(index: number, option: 'yes' | 'no'): void {
  this.selectedOptions[index] = option;
  const show = this.selectedOptions.some(opt => opt !== null);
  this.showresults = show;
  this.showResultsChanged.emit(show);
  this.hasYesAnswer = this.selectedOptions.some(opt => opt === 'yes');
  sessionStorage.setItem('hasYesAnswer', JSON.stringify(this.hasYesAnswer));
  this.hasYesAnswerChanged.emit(this.hasYesAnswer);
}

prevSlide(): void {
  if (this.currentIndex > 0) {
    this.currentIndex--;
  }
}

nextSlide(): void {
  if (this.currentIndex < this.sripa.length) {
    this.currentIndex++;
  }
}

goToSlide(index: number): void {
  this.currentIndex = index;
}

/**
 * Convert rich text JSON to safe HTML string
 */
renderRichText(blocks: any[]): string {
  if (!blocks) return '';

  const html = blocks.map((block: any) => {
    if (block.type === 'paragraph') {
      const text = block.children.map((child: any) => this.renderText(child)).join('');
      return `<p>${text}</p>`;
    }

    if (block.type === 'list') {
      const items = block.children.map((item: any) =>
        `<li>${item.children.map((child: any) => this.renderText(child)).join('')}</li>`
      ).join('');
      return `<ul>${items}</ul>`;
    }

    return '';
  }).join('');

  return html;
}


renderText(child: any): string {
  let text = child.text || '';

  // Handle links
  if (child.type === 'link' && child.url && child.children) {
    let url = child.url.trim();

    // Add protocol if missing
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }

    const innerText = child.children.map((c: any) => this.renderText(c)).join('');
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${innerText}</a>`;
  }

  // Handle bold
  if (child.bold) {
    text = `<strong>${text}</strong>`;
  }

  return text;
}
capitalizeFirstLetter(str: string | null) {
  if (!str) return null;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

checkHighSeverityYes(): boolean {
  return this.sripa.some((q, i) => 
    q.severity?.toLowerCase() === 'high' &&
    this.selectedOptions[i]?.trim().toLowerCase() === 'yes'
  );
}

submitAssessmentResponse(): Observable<any> {
  const respondedQuestions = this.sripa.map((q, index) => {
    const selected = this.selectedOptions[index];
    const answer = selected ? selected.charAt(0).toUpperCase() + selected.slice(1).toLowerCase() : '';
    return {
      question: q.text,
      answer: answer
    };
  });

  const numQuestionsAnswered = respondedQuestions.filter(r => r.answer !== '').length;

  const isHighSeverityYes = this.checkHighSeverityYes();
  const payload = {
    data: {
      response: respondedQuestions,
      AssessmentGuid: this.ssripaGuid,
      support_service: null,
      answeredHighratedquestion:isHighSeverityYes,
      guidedType: 'self-guided',
      CaseNumber: '', // Replace with actual case number if available
      IsAssessmentfromEducationModule: true,
      assessment_type:null,
    }
  };

   this.analytics.trackAssessmentSubmit('SSRIPA_Education_Module',numQuestionsAnswered);

  // ✅ Return the Observable instead of subscribing
  return this.apiService.postSsripaAssessmentResponse(payload);
}


}
