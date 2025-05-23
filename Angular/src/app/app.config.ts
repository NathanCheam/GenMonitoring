import {ApplicationConfig, importProvidersFrom, LOCALE_ID, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {routes} from './app.routes';
import {provideHttpClient} from "@angular/common/http";
import {MatSnackBarModule} from "@angular/material/snack-bar";

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom([MatSnackBarModule]),
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};
