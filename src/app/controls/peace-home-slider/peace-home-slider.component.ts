import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-peace-home-slider',
  templateUrl: './peace-home-slider.component.html',
  styleUrls: ['./peace-home-slider.component.scss'],
  standalone: true,
    imports: [CommonModule, IonicModule]
})
export class PeaceHomeSliderComponent  implements OnInit {
  items = [
    {
      image: 'assets/image-placeholder.png',
      title: 'Supportive Communication at Home',
      description: 'Jack and Mary have been married for five years. When Mary comes home stressed after a tough meeting with her manager, Jack listens attentively and offers support without judgment. He reassures Mary, making her feel valued and safe as she shares her honest thoughts and feelings.'
    },
    {
      image: 'assets/image-placeholder-2.png',
      title: 'Building Strong Relationships',
      description: 'John and Anna spend time together every weekend, exploring their mutual interests. This strengthens their relationship and helps them grow as a couple.'
    }
  ];

  currentIndex = 0;
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {}

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.cdr.detectChanges();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.cdr.detectChanges();
  }

  
}
