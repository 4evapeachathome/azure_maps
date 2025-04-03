import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

interface IpvPartnerViolence {
  id: number;
  multilinerichtextbox: {
    type: string;
    level?: number;
    format?: string;
    children: { text: string; type: string }[];
  }[];
}

@Component({
  selector: 'app-partnerviolence',
  templateUrl: './partnerviolence.page.html',
  styleUrls: ['./partnerviolence.page.scss'],
  standalone: false,
})
export class PartnerviolencePage implements OnInit {
  title: string = '';
  levels: IpvPartnerViolence[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getPartnerViolenceContent().subscribe(
      (response) => {
        debugger;
        const data = response.data[0];
        this.title = data.title;
        this.levels = data.ipvpartnerviolence;
      },
      (error) => {
        console.error('Error in PartnerViolencePage:', error.message);
      }
    );
  }

}
