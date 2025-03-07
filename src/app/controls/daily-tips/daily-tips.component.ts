import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { getConstant } from 'src/shared/constants';

@Component({
  selector: 'pathome-daily-tips',
  templateUrl: './daily-tips.component.html',
  styleUrls: ['./daily-tips.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  animations: [
    trigger('tipFade', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DailyTipsComponent implements OnInit {
  currentDate: Date;
  allTips: any[] = [];
  quotes: string = '';
  dailyPeaceTitle: string = '';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDay: number;
  weekDates: Date[] = [];
  currentWeekOffset = 0;
  slideDirection: 'left' | 'right' | null = null;
  userDateTime: Date;
  tips: { id: number; peacetips: string }[] = [];
  currentTip: string = '';
  private previousTipIndex: number | null = null;
  private storageKey: string = 'previousDailyTipIndex';

  constructor(private apiService: ApiService) {
    this.userDateTime = new Date();
    this.currentDate = new Date(this.userDateTime); // Initialize with current date
    this.selectedDay = this.userDateTime.getDay();
  }

  ngOnInit() {
    const storedIndex = localStorage.getItem(this.storageKey);
    this.previousTipIndex = storedIndex ? parseInt(storedIndex, 10) : null;
    this.calculateWeekDates();
    this.fetchDailyTipData();
  }

  calculateWeekDates() {
    const sunday = new Date(this.userDateTime);
    sunday.setDate(sunday.getDate() - sunday.getDay()); // Get Sunday of current week
    sunday.setDate(sunday.getDate() + (this.currentWeekOffset * 7)); // Adjust for week offset

    this.weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      this.weekDates.push(date);
    }

    // If we're on the current week, ensure current day is selected
    if (this.currentWeekOffset === 0) {
      this.selectedDay = this.userDateTime.getDay();
    } else if (this.selectedDay === undefined || this.selectedDay < 0 || this.selectedDay > 6) {
      this.selectedDay = 0; // Default to Sunday if no valid selection
    }

    // Update currentDate to the selected day's date
    this.currentDate = new Date(this.weekDates[this.selectedDay]);
  }

  fetchDailyTipData() {
    this.apiService.getDailyTip().subscribe(
      (response) => {
        if (response.data && response.data.length > 0) {
          this.allTips = response.data[0].description;
          this.dailyPeaceTitle = response.data[0].title;

          if (this.allTips && this.allTips.length > 0) {
            this.generateRandomTip();
          } else {
            this.setDefaultTip();
          }
        } else {
          this.setDefaultTip();
        }
      },
      (error) => {
        console.error('Error fetching daily tip:', error);
        this.setDefaultTip();
      }
    );
  }

  setDefaultTip() {
    const peaceTip = getConstant('HEALTH_TIPS', 'DEFAULT_TIP');
    if (peaceTip) {
      this.currentTip = peaceTip.message;
      this.dailyPeaceTitle = peaceTip.title;
    }
  }

  generateRandomTip() {
    if (this.allTips.length === 1) {
      this.currentTip = this.allTips[0].Description;
      return;
    }

    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * this.allTips.length);
    } while (randomIndex === this.previousTipIndex);

    const randomTip = this.allTips[randomIndex];
    this.currentTip = randomTip.Description;
    this.previousTipIndex = randomIndex;

    localStorage.setItem(this.storageKey, randomIndex.toString());
  }

  navigateWeek(direction: 'prev' | 'next') {
    this.slideDirection = direction === 'next' ? 'left' : 'right';
    this.currentWeekOffset += direction === 'next' ? 1 : -1;

    // Reset selection when moving away from current week
    if (this.currentWeekOffset !== 0) {
      this.selectedDay = 0;
    } else {
      // If returning to current week, select current day
      this.selectedDay = this.userDateTime.getDay();
    }

    setTimeout(() => {
      this.calculateWeekDates();
      this.fetchDailyTipData();

      // Remove the slide class after animation
      setTimeout(() => {
        this.slideDirection = null;
      }, 300);
    }, 50);
  }

  isCurrentDay(index: number): boolean {
    if (this.currentWeekOffset !== 0) return false;

    const weekDate = this.weekDates[index];
    return (
      weekDate &&
      this.userDateTime.getDate() === weekDate.getDate() &&
      this.userDateTime.getMonth() === weekDate.getMonth() &&
      this.userDateTime.getFullYear() === weekDate.getFullYear()
    );
  }

  selectDay(index: number) {
    console.log(`Day selected: ${index}`);

    if (this.selectedDay !== index) {
      this.selectedDay = index;
      // Update currentDate to the selected day's date
      this.currentDate = new Date(this.weekDates[index]);
      this.generateRandomTip();
    } else {
      console.log(`Day ${index} is already selected. No new tip generated.`);
    }
  }
}
