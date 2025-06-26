import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'pathome-typesof-abuse-card',
  templateUrl: './typesof-abuse-card.component.html',
  styleUrls: ['./typesof-abuse-card.component.scss'],
  standalone: true,
        imports: [CommonModule, IonicModule],
        // animations: [
        //   trigger('expandCollapse', [
        //     transition(':enter', [
        //       style({ height: '0', opacity: 0 }),
        //       animate('300ms ease-in-out', style({ height: '*', opacity: 1 })),
        //     ]),
        //     transition(':leave', [
        //       animate('300ms ease-in-out', style({ height: '0', opacity: 0 })),
        //     ])
        //   ])
        // ]
  
})
export class TypesofAbuseCardComponent  implements OnInit {
  isExpanded = false;
  physicalAbuse: any = null;
  @Input() imagePosition: 'left' | 'right' = 'left';  // Controls image position
  @Input() buttonPosition: 'left' | 'right' = 'right'; 
  @Input() endpoint: string = '';
  @Input() paramName: string = '';
  @Output() loaded = new EventEmitter<void>();

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPhysicalAbuseData(this.endpoint,this.paramName);
  }

  loadPhysicalAbuseData(endPoint: string,paramName: string) {
    this.apiService.getPhysicalAbuses(endPoint,paramName).subscribe(
    
      (res: any) => {
        if (res && res[paramName]) {
          this.physicalAbuse = res[paramName];
        }
        this.loaded.emit(); // Emit loaded event after data is fetched
      },
      (error) => {
        console.error('Error fetching physical abuse data:', error);
        this.loaded.emit();
      }
    );
  }

  toggleReadMore() {
    this.isExpanded = !this.isExpanded;
  }

  getHeadingText(contentArray: any[]): string {
    const heading = contentArray.find(item => item.type === 'heading');
    return heading?.children[0]?.text || 'Physical Abuse';
  }

  getDescriptionText(contentArray: any[]): string {
    let description = '';

    // Existing logic for paragraph
    const paragraph = contentArray.find(item => item.type === 'paragraph');
    if (paragraph) {
      description += paragraph.children[0]?.text || '';
    }

    // Logic for list
    const list = contentArray.find(item => item.type === 'list');
    if (list && list.children?.length > 0) {
      const listItems = list.children
        .filter((item: any) => item.type === 'list-item')
        .map((item: any) => item.children[0]?.text || '')
        .filter((text: string) => text)
        .map((text: string) => `- ${text}`)
        .join('\n');
      if (listItems) {
        description += (description ? '\n' : '') + listItems;
      }
    }

    return description;
  }

  // New method to get paragraph lines
  getParagraphLines(): string[] {
    const description = this.physicalAbuse ? this.getDescriptionText(this.physicalAbuse.titleContent) : '';
    return description
      .split('\n')
      .filter(line => !line.startsWith('-'));
  }

  // New method to get list items
  getListItems(): string[] {
    const description = this.physicalAbuse ? this.getDescriptionText(this.physicalAbuse.titleContent) : '';
    return description
      .split('\n')
      .filter(line => line.startsWith('-'))
      .map(line => line.substring(2).trim());
  }
}
