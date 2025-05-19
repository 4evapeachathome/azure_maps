import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-assessmentresult',
  templateUrl: './assessmentresult.component.html',
  styleUrls: ['./assessmentresult.component.scss'],
  standalone: true,
        imports: [CommonModule, IonicModule, FormsModule],
})
export class AssessmentresultComponent  implements OnInit {
  caseNumber:string = '';
  loggedInUser:any = null;
  searchQuery: string = ''; 

  constructor(private router:Router) { }

  ngOnInit() {}

  viewResult() {
   // debugger;
    this.router.navigate(['/riskassessmentsummary']);
  }

  onSearchChange() {  
  }

}
