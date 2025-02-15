import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  /**
   * Récupère les données météo en fonction de la latitude et la longitude.
   * Open-Meteo est gratuit et ne nécessite pas de clé API.
   * @param latitude Latitude de la ville
   * @param longitude Longitude de la ville
   * @returns Observable contenant les données météo
   */
  getWeather(latitude: number, longitude: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
  }
}
