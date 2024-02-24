import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';
import { HttpClient, HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideMatomo, withRouter } from 'ngx-matomo-client';

// In order to make ngx-translate to work with
// Android 17 according to
// https://github.com/ngx-translate/core/issues/1460

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return  new  TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export const provideTranslation = () => ({
  defaultLanguage: 'pt',
  loader: {
    provide: TranslateLoader,
    useFactory: HttpLoaderFactory,
    deps: [HttpClient],
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideMatomo(
      {
        trackerUrl: 'https://stats.anteropires.com',
        siteId: 1
      },
      withRouter()
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([errorInterceptor])
    ),
    importProvidersFrom([
      HttpClientModule,
      TranslateModule.forRoot(provideTranslation())
    ]),
    provideRouter(routes,
      withRouterConfig({
        onSameUrlNavigation: 'reload'
      })
    )]
};
