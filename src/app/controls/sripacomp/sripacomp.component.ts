import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormsModule } from '@angular/forms';


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
  quizTitle = '';
sripa: any[] = [];
yesanswer: any[] = [];
rating = '';
currentIndex = 0;
showAnswers: boolean[] = [];
selectedOptions: string[] = [];

constructor(private apiService: ApiService) {}

ngOnInit() {
  this.loadQuiz();
}

loadQuiz(): void {
  this.apiService.getSripaa().subscribe((quiz) => {
    if (quiz) {
      this.quizTitle = quiz.title;
      this.sripa = quiz.sripa || [];
      this.rating = quiz.rating || '';
      this.yesanswer = quiz.yesanswer || [];
      this.showAnswers = new Array(this.sripa.length).fill(false);
      this.selectedOptions = new Array(this.sripa.length).fill(null);
    }
  });
}

selectOption(index: number): void {
  this.showAnswers[index] = true;
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
  if (child.bold) {
    text = `<strong>${text}</strong>`;
  }
  if (child.type === 'text' && text.includes('http')) {
    text = `<a href="${text}" target="_blank">${text}</a>`;
  }
  return text;
}


}
