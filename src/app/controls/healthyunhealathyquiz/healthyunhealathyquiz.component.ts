import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-healthyunhealathyquiz',
  templateUrl: './healthyunhealathyquiz.component.html',
  styleUrls: ['./healthyunhealathyquiz.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule],
    animations: [
        trigger('slideAnimation', [
          transition(':enter', [
            style({ 
              opacity: 0, 
              transform: 'translateX(100%)' 
            }),
            animate('500ms ease-out', style({ 
              opacity: 1, 
              transform: 'translateX(0)' 
            }))
          ]),
          transition(':leave', [
            animate('500ms ease-out', style({ 
              opacity: 0, 
              transform: 'translateX(-100%)' 
            }))
          ])
        ])
      ]
})
export class HealthyunhealathyquizComponent  implements OnInit {
  quizTitle = '';
  quizSubheading = '';
  questions: any[] = [];
  currentIndex = 0;
  showAnswers: boolean[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.apiService.getQuizzes().subscribe((quiz) => {
      if (quiz) {
        this.quizTitle = quiz.title;
        this.quizSubheading = quiz.subheading;
        this.questions = quiz.questions.map((q: any) => ({
          ...q,
          selected: null // 'healthy' or 'unhealthy'
        }));
        this.showAnswers = new Array(this.questions.length).fill(false);
      }
    });
  }

  selectOption(index: number, option: 'healthy' | 'unhealthy'): void {
    this.questions[index].selected = option;
    this.showAnswers[index] = true; // Show the answer immediately after selection
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    }
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
  }

  // Helper to determine if the answer is healthy based on answerkey
  isHealthyAnswer(answerkey: boolean | null): boolean {
    return answerkey === true;
  }

}
