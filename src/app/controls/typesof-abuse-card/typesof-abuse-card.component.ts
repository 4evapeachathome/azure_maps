import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-typesof-abuse-card',
  templateUrl: './typesof-abuse-card.component.html',
  styleUrls: ['./typesof-abuse-card.component.scss'],
  standalone: true,
        imports: [CommonModule, IonicModule],
        animations: [
          trigger('expandCollapse', [
            transition(':enter', [
              style({ height: '0', opacity: 0 }),
              animate('300ms ease-in-out', style({ height: '*', opacity: 1 })),
            ]),
            transition(':leave', [
              animate('300ms ease-in-out', style({ height: '0', opacity: 0 })),
            ])
          ])
        ]
  
})
export class TypesofAbuseCardComponent  implements OnInit {
  isExpanded = false;

  examples = [
    { id: 1, text: 'The partner throws things, such as kitchen utensils, cups, plates, etc., or burns with candle sticks or cigarette buds at the other partner when angry' },
    { id: 2, text: 'The partner uses hands or other body parts to hurt, such as slapping, choking, kicking, biting, or scratching, burns with candle sticks or cigarette buds' },
    { id: 3, text: 'The partner uses knives, guns, or heavy objects to threaten to hurt children.' },
    { id: 4, text: 'The partner confines or isolates the partner from the outside world including friends, or access to help' },
    { id: 5, text: 'The partner threatens to starve and kill the family' }
  ];


  constructor() { }

  ngOnInit() {}

  toggleReadMore() {
    this.isExpanded = !this.isExpanded;
  }

}
