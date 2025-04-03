import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

interface RichTextChild {
  text?: string; // Optional, as not all nodes have text (e.g., a list-item may only have children)
  type: string;
  children?: RichTextChild[]; // Allow nested children
}

interface RichTextElement {
  type: string;
  level?: number;
  format?: string;
  children: RichTextChild[];
}

interface IpvPartnerViolence {
  id: number;
  multilinerichtextbox: RichTextElement[];
}



@Component({
  selector: 'pathome-partner-violence-progressbar',
  templateUrl: './partner-violence-progressbar.component.html',
  styleUrls: ['./partner-violence-progressbar.component.scss'],
    standalone: true,
    imports: [CommonModule, IonicModule],
})
export class PartnerViolenceProgressbarComponent  implements OnInit {
  @Input() level!: IpvPartnerViolence;

  constructor() {}

  ngOnInit() {}

  getHeadingText(level: IpvPartnerViolence): string {
    const heading = level.multilinerichtextbox.find((item) => item.type === 'heading');
    if (heading && heading.children && heading.children[0] && heading.children[0].text) {
      return heading.children[0].text;
    }
    return 'Unknown Level';
  }

  getLevelNumber(level: IpvPartnerViolence): number {
    const headingText = this.getHeadingText(level);
    console.log('Heading text:', headingText);
    const levelNumber = parseInt(headingText.split(' ')[1], 10) || 0;
    console.log('Level number:', levelNumber);
    return levelNumber;
  }

  getDescription(level: IpvPartnerViolence): string {
    return level.multilinerichtextbox
      .map((item) => {
        if (item.type === 'paragraph' && item.children) {
          return item.children.map((child) => child.text).join(' ');
        } else if (item.type === 'list' && item.format === 'unordered' && Array.isArray(item.children)) {
          return `<ul>` + 
            item.children
              .map((listItem) => {
                if (listItem.children && Array.isArray(listItem.children)) {
                  return `<li>${listItem.children.map((child) => child.text).join(' ')}</li>`;
                }
                return ''; // Fallback in case listItem.children is undefined
              })
              .join('') +
            `</ul>`;
        }
        return '';
      })
      .join('');
  }
  

  getListItems(level: IpvPartnerViolence): string[] {
    const lists = level.multilinerichtextbox.filter((item) => item.type === 'list');
    return lists
      .map((list) => {
        const listItem = list.children[0];
        if (listItem && listItem.type === 'list-item' && listItem.children && listItem.children.length > 0) {
          const textNode = listItem.children[0];
          return textNode && textNode.type === 'text' && textNode.text ? textNode.text : '';
        }
        return '';
      })
      .filter((text) => text !== '');
  }

  getProgressBarClasses(levelNumber: number): string[] {
    if (levelNumber === 1) return ['yellow'];
    if (levelNumber === 2) return ['yellow', 'orange'];
    if (levelNumber === 3) return ['yellow', 'orange', 'red'];
    return [];
  }

}
