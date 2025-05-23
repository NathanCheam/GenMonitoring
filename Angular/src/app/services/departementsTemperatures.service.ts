import {inject, Injectable} from '@angular/core';
import {Departement} from '../models/departements/departement';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../../environments/environment";

export interface GetDepartementsResponse {
  dimension: string;
  metriques: Departement[];
}

export interface GetDepartementResponse {
  success: boolean;
  message: string;
  data: {
    departement: Departement;
  }
}

export interface DeleteTemperatureResponse {
  success: boolean;
  data: [];
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartementsTemperaturesService {
  private httpClient = inject(HttpClient);
  readonly url = `${environment.apiURL}`;
  readonly httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  getDepartements(): Observable<GetDepartementsResponse> {
    return this.httpClient.get<GetDepartementsResponse>('/api/monitoring/departement/', this.httpOptions);
  }

  async getDepartement(id: number): Promise<Departement> {
    const departement$ = this.httpClient.get<GetDepartementResponse>(this.url + '/departements/' + id, this.httpOptions);
    const response = await firstValueFrom(departement$);
    return response.data.departement;
  }
}
