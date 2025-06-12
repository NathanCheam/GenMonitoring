import {inject, Injectable} from '@angular/core';
import {Interco} from '../models/intercos/interco';
import {IntercoStatus} from '../models/intercos/intercoStatus';
import {map, Observable, of, tap} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";

export interface GetIntercosResponse {
  dimension: string;
  metriques: Interco[];
}

export interface GetIntercoDonneesResponse {
  dimension: string;
  metriquesDonnees: IntercoStatus[];
}
@Injectable({
  providedIn: 'root'
})
export class IntercosService {
  private httpClient = inject(HttpClient);
  readonly url = `${environment.apiURL}`;
  readonly httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };
  private readonly STORAGE_KEY = 'intercos_data';

  getIntercos(): Observable<GetIntercosResponse> {
    // Vérifier d'abord si les données sont dans le localStorage
    const cachedData = localStorage.getItem(this.STORAGE_KEY);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      // Vérifier si les données ne sont pas trop anciennes (ex: moins de 1 heure)
      const timestamp = localStorage.getItem(this.STORAGE_KEY + '_timestamp');
      if (timestamp && (Date.now() - Number(timestamp)) < 3600000) { // 1 heure
        return of(parsedData);
      }
    }

    // Si pas de données en cache ou trop anciennes, faire l'appel API
    return this.httpClient.get<Interco[]>('/api/monitoring/interco-sel/', this.httpOptions)
        .pipe(
            map(response => {
              return {
                dimension: 'intercos',
                metriques: Array.isArray(response) ? response.map(item => ({
                  ...item,
                  metrique: item.nom // Ajoute un champ temporaire pour compatibilité
                })) : []
              };
            }),
            tap(result => {
              // Stocker les données dans le localStorage
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(result));
              localStorage.setItem(this.STORAGE_KEY + '_timestamp', Date.now().toString());
            })
        );
  }

  getIntercoStatus(url: string): Observable<GetIntercoDonneesResponse> {
    const storageKey = `interco_status_${encodeURIComponent(url)}`;

    // Vérifier d'abord si les données sont dans le localStorage
    const cachedData = localStorage.getItem(storageKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      // Vérifier si les données ne sont pas trop anciennes (ex: moins de 5 minutes)
      const timestamp = localStorage.getItem(storageKey + '_timestamp');
      if (timestamp && (Date.now() - Number(timestamp)) < 300000) { // 5 minutes
        return of(parsedData);
      }
    }

    return this.httpClient.get<IntercoStatus[]>(url, this.httpOptions)
        .pipe(
            map(response => {
              return {
                dimension: 'interco-status',
                metriquesDonnees: Array.isArray(response) ? response.map(item => ({
                  ...item,
                  metrique: [item.datetime, item.status] // Ajoute un champ temporaire pour compatibilité
                })) : []
              };
            }),
            tap(result => {
              // Stocker les données dans le localStorage
              localStorage.setItem(storageKey, JSON.stringify(result));
              localStorage.setItem(storageKey + '_timestamp', Date.now().toString());
            })
        );
  }
}
