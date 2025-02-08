import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-us-state-law-details',
  templateUrl: './us-state-law-details.component.html',
  styleUrls: ['./us-state-law-details.component.scss'],
  standalone: true,
  imports: [CommonModule,  IonicModule, RouterModule ],
})
export class UsStateLawDetailsComponent implements OnInit {
  stateName!: string;
  stateLawContent!:string;
  imgPath!:string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
   this.stateName = this.route.snapshot.paramMap.get('stateName')!;
   this.stateLawContent = "Cal. Fam. Cole $6203, Cal. Fam. Code $6209-6211: Abuse means any of the following: Intentionally or recklessly trying to or do cause bodily injury, secual assault, placing the victim in appreheension of serious injuies, and abuse is not limited to the actual infliction of physical injury or assault. Victims include cohabitants/formal cohabitants (someone who is or was in the same household), dating relationships including individuals in intimate interactions, spouses, former spouses, someone dating or in an engagement, a parent of the child, and a close family member.";
    this.imgPath = '../../../assets/states_map/' + this.stateName.toUpperCase() + '.svg';
  }
}
