import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './api.service';
import { CharityEvent, WeatherInfo } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  providers: [ApiService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Zhejiang Charity Events (Angular SPA)';
  events: CharityEvent[] = [];
  weatherMap: { [key: string]: WeatherInfo } = {};
  selectedEvent: CharityEvent | null = null;

  userName = '';
  userEmail = '';
  contactNumber = '';
  tickets = 1;
  message = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.apiService.getEvents().subscribe((data) => {
      this.events = data;
      this.events.forEach(e => {
        if (e.location && !this.weatherMap[e.location]) {
          this.apiService.getWeather(e.location).subscribe(w => this.weatherMap[e.location] = w);
        }
      });
    });
  }

  selectEvent(event: CharityEvent): void {
    this.selectedEvent = event;
    this.message = '';
  }

  submit(): void {
    if (!this.selectedEvent) return;
    const payload = {
      event_id: this.selectedEvent.event_id,
      user_name: this.userName,
      user_email: this.userEmail,
      contact_number: this.contactNumber,
      tickets_purchased: this.tickets
    };

    this.apiService.submitRegistration(payload).subscribe({
      next: (res) => {
        this.message = '✅ ' + res.message;
        this.loadEvents();
      },
      error: (err) => {
        this.message = '❌ ' + (err.error?.error || 'Registration failed');
      }
    });
  }
}
