import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CharityEvent, WeatherInfo } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getEvents(): Observable<CharityEvent[]> {
    return this.http.get<CharityEvent[]>(`${this.baseUrl}/events`);
  }

  getWeather(location: string): Observable<WeatherInfo> {
    return this.http.get<WeatherInfo>(`${this.baseUrl}/weather?location=${encodeURIComponent(location)}`);
  }

  submitRegistration(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/registrations`, data);
  }
}