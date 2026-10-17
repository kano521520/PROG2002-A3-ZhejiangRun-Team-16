export interface CharityEvent {
  event_id: number;
  title: string;
  category_id?: number;
  category_name?: string;
  location: string;
  date: string;
  description?: string;
  image_url?: string;
  registration_count?: number;
}

export interface WeatherInfo {
  location: string;
  temperature: string;
  windspeed?: string;
  condition?: string;
}