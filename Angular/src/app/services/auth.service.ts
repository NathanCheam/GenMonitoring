import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {firstValueFrom} from 'rxjs';

export type getResponseLogin = {
  "success": boolean,
  "data": {
    "user": {
      "id": number,
      "name": string,
      "email": string,
    },
    "token": string,
  },
  "message": string
}

export type User = {
  id: number;
  name: string;
  email: string;
  token: string;
}

export type Identite = {
  email: string;
  password: string;
}

export type RegisterRequest = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export type RegisterResponse = {
  "success": boolean,
  "data": {
    "user": {
      "id": number,
      "prenom": string,
      "nom": string,
      "email": string,
    },
    "token": string,
  },
  "message": string
}

export const ANONYMOUS_USER: User = <User>{
  id: 0,
  name: '',
  email: '',
  token: ''
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);
  readonly url = `${environment.apiURL}`;

  private readonly httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json', 'Accept': 'application/json'}),
  };

  readonly #userSignal = signal<User>(ANONYMOUS_USER);
  readonly user = this.#userSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.user().id !== 0);

  constructor() {
  }

  async login(credential: Identite): Promise<User> {
    try {
      // First get the token from login endpoint
      const response = await firstValueFrom(
        this.http.post<getResponseLogin>(`${this.url}/login`, credential, this.httpOptions)
      );

      if (response.success) {
        console.log("LOGIN SUCCESS");
        console.log(response.data);

        // Store token temporarily
        const token = response.data.token;

        // Add authorization header for subsequent requests
        const authOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          })
        };

        // Get user details from /me endpoint
        const userResponse = await firstValueFrom(
          this.http.get<{ success: boolean; data: { user: any } }>(`${this.url}/user`, authOptions)
        );

        if (userResponse.success) {
          // Create complete user object with token
          const user: User = {
            id: userResponse.data.user.id,
            name: userResponse.data.user.name,
            email: userResponse.data.user.email,
            token: token
          };

          this.setUser(user);
          console.log(user);
          return user;
        } else {
          throw new Error('Failed to fetch user details');
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(request: RegisterRequest): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.http.post<RegisterResponse>(`${this.url}/register`, request, this.httpOptions)
      );

      if (response.success) {
        const user: User = {
          id: response.data.user.id,
          name: `${response.data.user.nom} ${response.data.user.prenom}`,
          email: response.data.user.email,
          token: response.data.token
        };
        this.setUser(user);
        return user;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.url}/logout`, {}, this.httpOptions));
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearUser();
      await this.router.navigateByUrl('/login');
    }
  }

  /**
   * Set authenticated user and save to storage
   */
  private setUser(user: User): void {
    this.#userSignal.set(user);
  }

  /**
   * Clear the user data
   */
  private clearUser(): void {
    this.#userSignal.set(ANONYMOUS_USER);
  }
}
