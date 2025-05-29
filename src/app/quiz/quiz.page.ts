import { Component, OnInit } from '@angular/core';
import { MenuService } from 'src/shared/menu.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.page.html',
  styleUrls: ['./quiz.page.scss'],
  standalone: false,
})
export class QuizPage implements OnInit {

  constructor(private menuService:MenuService) { }

  ngOnInit() {
  }

  expandMenu(sectionTitle: string) {
    this.menuService.toggleAdditionalMenus(true, sectionTitle);
  }

}
