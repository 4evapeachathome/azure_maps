import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-daily-tips',
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
  randomQuoteId:string = '';
  quotes : string = '';
  dailyPeaceTitle:string = '';
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  selectedDay: number;
  weekDates: Date[] = [];
  currentWeekOffset = 0;
  slideDirection: 'left' | 'right' | null = null;
  userDateTime: Date;
  tips: { id: number; peacetips: string }[] = [];
  currentTip: string = '';
  lastTipIndex: number = -1;

  constructor(private apiService: ApiService) {
    this.userDateTime = new Date();
    this.currentDate = this.userDateTime;
    this.selectedDay = this.userDateTime.getDay();
  }

  ngOnInit() {
    this.calculateWeekDates();
    this.fetchDailyTipTitle();
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

    // Update current date for display
    this.currentDate = new Date(sunday);

    // If we're on the current week, ensure current day is selected
    if (this.currentWeekOffset === 0) {
      this.selectedDay = this.userDateTime.getDay();
    }
  }

  fetchDailyTipTitle(){
    this.apiService.getDailyPeaceTipTitle().subscribe((res) => {
      this.dailyPeaceTitle = res.data
        .map((item: any) => item.DailyPeaceTipsTitle) 
        .filter((title: string | null) => title !== null); 
    },
    (error) => {
      console.error('Error fetching daily tip Title:', error);
      this.dailyPeaceTitle = 'Daily Peace Tips';        
    }
  );
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

  fetchDailyTipData() {
    // Fetch daily peace tip ID from API
    this.apiService.getDailyPeaceTipId().subscribe((res) => {
      const ids = res.data.map((item : any) => item.id); 
      const lastTipId = localStorage.getItem('lastPeaceTip');
      const filteredIds = lastTipId ? ids.filter((id : any) => id.toString() !== lastTipId) : ids;
      if (filteredIds.length === 0) {
        localStorage.removeItem('lastPeaceTipId');
        this.randomQuoteId = ids[Math.floor(Math.random() * ids.length)];
    } else {
        const randomIndex = Math.floor(Math.random() * filteredIds.length);
        this.randomQuoteId = filteredIds[randomIndex];
    }
      localStorage.setItem('lastPeaceTipId',  this.randomQuoteId.toString());
    },(error) => {console.log('Error while fetching the Tip Id',error);
    });

    // Fetch daily peace tip content by Id
    this.apiService.getDailyTips(this.randomQuoteId).subscribe(
      (response) => {
        this.currentTip = response.data.DailyPeaceTipsDescrition;
      },
      (error) => {
        console.error('Error fetching daily tip:', error);
        this.currentTip = 'Take deep breaths. Inhale deep, hold breath for 3 seconds, Exhale. Pause for 3 seconds. Repeat 6-10 times, preferably with your eyes closed';        
      }
    );
  }


  isCurrentDay(index: number): boolean {
    if (this.currentWeekOffset !== 0) return false;
    
    const weekDate = this.weekDates[index];
    return weekDate && 
           this.userDateTime.getDate() === weekDate.getDate() && 
           this.userDateTime.getMonth() === weekDate.getMonth() && 
           this.userDateTime.getFullYear() === weekDate.getFullYear();
  }

  selectDay(index: number) {
    this.selectedDay = index;
    this.fetchDailyTipData();
  }
}
