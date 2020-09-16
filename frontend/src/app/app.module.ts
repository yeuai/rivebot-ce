import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import 'reflect-metadata';
import '../polyfills';

import { ChartsModule } from 'ng2-charts';
import { LoggerModule } from 'ngx-logger';
import { ToastrModule } from 'ngx-toastr';

// NG Service
import { AppRoutingModule } from './app-routing.module';

// NG Components
import { LoadingBarHttpModule } from '@ngx-loading-bar/http';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AboutComponent } from './components/home/about.component';
import { HomeComponent } from './components/home/home.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout.component';
import { PageContentComponent } from './layouts/admin/page-content/page-content.component';
import { LoginComponent } from './layouts/login/login.component';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { HoSoViewportLayoutComponent } from './layouts/viewport/viewport-layout.component';
import { AppConfigService } from './services/common/app-config.service';
import { AuthenticationService } from './services/common/auth/authentication.service';
import { MenuService } from './services/common/menu.service';
import { ErrorInterceptor } from './shared/interceptors/error.interceptor';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { SharedModule } from './shared/shared.module';

// Import 3rd party components
import { SidebarMenuModule } from '@app/shared/sidebar-menu/sidebar-menu.module';
import {
  AppAsideModule,
  AppBreadcrumbModule,
  AppFooterModule,
  AppHeaderModule,
  AppSidebarModule,
} from '@coreui/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BsDropdownModule } from 'ngx-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { DefaultLayoutComponent } from './layouts/default/default-layout.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

/**
 * Preload app config
 * Note: AoT requires an exported function for factories
 */
export function loadAppConfig(svConfig: AppConfigService) {
  return () => svConfig.loadConfig();
}

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    DefaultLayoutComponent,
    PageContentComponent,
    LoginComponent,
    HoSoViewportLayoutComponent,
    PageNotFoundComponent,
    HomeComponent,
    AboutComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    AppAsideModule,
    AppBreadcrumbModule.forRoot(),
    AppFooterModule,
    AppHeaderModule,
    AppSidebarModule,
    PerfectScrollbarModule,
    NgbModule,
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    LoggerModule.forRoot({
      level: environment.LOG_LEVEL
    }),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    SharedModule,
    SidebarMenuModule,
    LoadingBarHttpModule,
    LoadingBarHttpClientModule,
    LoadingBarRouterModule,
    ChartsModule,
  ],
  providers: [
    AppConfigService,
    AuthenticationService,
    MenuService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: APP_INITIALIZER,
      deps: [AppConfigService],
      multi: true,
      useFactory: loadAppConfig
    },
    /**
     * Provider used to create fake backend
     */
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
