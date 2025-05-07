import {inject, Injectable} from '@angular/core';
import {Departement} from '../models/departement';
import {Temperature} from '../models/temperature';
import {firstValueFrom, Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';

export interface GetDepartementsResponse {
  success: boolean;
  message: string;
  data: {
    departements: Departement[];
  }
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

export interface GetTemperaturesResponse {
  success: boolean;
  message: string;
  data: {
    temperatures: Temperature[];
  }
}

export interface UpdateTemperatureResponse {
  success: boolean;
  message: string;
  data: {
    temperature: Temperature;
  }
}

@Injectable({
  providedIn: 'root'
})
export class DepartementsService {
  private httpClient = inject(HttpClient);
  readonly url = 'http://localhost:8000/api';
  readonly httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  getDepartements(): Observable<GetDepartementsResponse> {
    return this.httpClient.get<GetDepartementsResponse>(this.url + '/departements', this.httpOptions);
  }

  async getDepartement(id: number): Promise<Departement> {
    const departement$ = this.httpClient.get<GetDepartementResponse>(this.url + '/departements/' + id, this.httpOptions);
    const response = await firstValueFrom(departement$);
    return response.data.departement;
  }

  getTemperatures(idDepartement: number): Observable<GetTemperaturesResponse> {
    return this.httpClient.get<GetTemperaturesResponse>(this.url + '/depenses/personne/' + idDepartement, this.httpOptions);
  }


  async updateTemperature(temperature: Temperature): Promise<Temperature> {
    const temperature$ = this.httpClient.put<UpdateTemperatureResponse>(
      `${this.url}/temperatures/${temperature.id}`,
      temperature,
      this.httpOptions
    );
    const response = await firstValueFrom(temperature$);
    return response.data.temperature;
  }

  async createTemperature(temperature: Temperature): Promise<Temperature> {
    const temperature$ = this.httpClient.post<UpdateTemperatureResponse>(
      `${this.url}/temperatures`,
      temperature,
      this.httpOptions
    );
    const response = await firstValueFrom(temperature$);
    return response.data.temperature;
  }

  async deleteTemperature(id: number): Promise<number> {
    const delete$ = this.httpClient.delete<DeleteTemperatureResponse>(
      `${this.url}/temperatures/${id}`,
      this.httpOptions
    );

    const response = await firstValueFrom(delete$);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete expense');
    }

    return id;
  }




}
