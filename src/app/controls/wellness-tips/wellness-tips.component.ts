import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { getConstant } from 'src/shared/constants';
import { WellnessTipQuery } from '../../state/wellness-tip.query';
import { WellnessTipService } from './services/wellness-tip.service';


@Component({
  selector: 'pathome-wellness-tips',
  templateUrl: './wellness-tips.component.html',
  styleUrls: ['./wellness-tips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class WellnessTipsComponent  implements OnInit {
  title$ = this.wellnessTipQuery.title$;
  subtitle$ = this.wellnessTipQuery.subtitle$;
  imageUrl$ = this.wellnessTipQuery.imageUrl$;
  currentTip$ = this.wellnessTipQuery.currentTip$;
  tips: { id: number; wellnesstips: string }[] = [];


  constructor(private wellnessTipService: WellnessTipService, private wellnessTipQuery: WellnessTipQuery) { }

  ngOnInit() {
    this.wellnessTipService.fetchWellnessTip();
  }
}
