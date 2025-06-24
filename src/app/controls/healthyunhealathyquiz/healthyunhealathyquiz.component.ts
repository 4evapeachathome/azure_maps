import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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
  @Output() loaded = new EventEmitter<void>();
  showAnswers: boolean[] = [];

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.apiService.getQuizzes().subscribe((quiz) => {
      if (quiz) {
        this.quizTitle = quiz.title;
        this.quizSubheading = quiz.subheading.replace('.', '.\n').replace(/\n\s+/, '\n');
        this.questions = quiz.questions.map((q: any) => ({
          ...q,
          selected: null // 'healthy' or 'unhealthy'
        }));
        this.showAnswers = new Array(this.questions.length).fill(false);
      }
      this.loaded.emit(); // Emit loaded event after quiz is loaded
    }, (error) => {
      console.error('Error loading quiz:', error);
      this.loaded.emit(); // Emit loaded event even if there's an error
    });
  }

  selectOption(index: number, option: 'healthy' | 'unhealthy'): void {
    this.questions[index].selected = option;
  
    const isCorrect = (option === 'healthy' && this.questions[index].answerkey === true) ||
                      (option === 'unhealthy' && this.questions[index].answerkey === false);
  
    this.showAnswers[index] = !isCorrect; // Show answer if user's selection is wrong
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

  isCorrectAnswer(index: number): boolean {
    return this.questions[index].selected &&
           this.showAnswers[index] === false;
  }

}
