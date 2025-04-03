import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';

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
  physicalAbuse: any = null;
  @Input() imagePosition: 'left' | 'right' = 'left';  // Controls image position
  @Input() buttonPosition: 'left' | 'right' = 'right'; 
  @Input() endpoint: string = '';
  @Input() paramName: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPhysicalAbuseData(this.endpoint,this.paramName);
  }

  loadPhysicalAbuseData(endPoint: string,paramName: string) {
    this.apiService.getPhysicalAbuses(endPoint,paramName).subscribe(
    
      (res: any) => {
        if (res && res.physicalAbuse) {
          this.physicalAbuse = res.physicalAbuse;
        }
      },
      (error) => {
        console.error('Error fetching physical abuse data:', error);
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
    const paragraph = contentArray.find(item => item.type === 'paragraph');
    return paragraph?.children[0]?.text || '';
  }

}
