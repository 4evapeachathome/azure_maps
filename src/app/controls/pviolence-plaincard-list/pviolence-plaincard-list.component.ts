import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'pathome-pviolence-plaincard-list',
  templateUrl: './pviolence-plaincard-list.component.html',
  styleUrls: ['./pviolence-plaincard-list.component.scss'],
  standalone: true,
        imports: [CommonModule, IonicModule]
})
export class PviolencePlaincardListComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
