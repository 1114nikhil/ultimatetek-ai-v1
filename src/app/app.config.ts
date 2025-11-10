import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {  TranslateModule } from '@ngx-translate/core';

import { provideTranslateHttpLoader, TranslateHttpLoader } from '@ngx-translate/http-loader';



export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
     provideHttpClient(withFetch()),
    provideRouter(routes),
    provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: Aura,
                options: { darkModeSelector: false,} 
            }
        }),
         provideHttpClient(withInterceptorsFromDi()),
          provideTranslateHttpLoader({
      prefix: '/assets/i18n/',
      suffix: '.json'
    }),
          importProvidersFrom(
      HttpClientModule,

      // ✅ Global translation setup
      TranslateModule.forRoot({
        loader: {
          provide: TranslateHttpLoader,
          useClass: TranslateHttpLoader
        },
        defaultLanguage: 'ar'
      })
    ),
  ]
};
