import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DefaultLayoutComponent } from './layouts/default/default-layout.component';
import { LoginComponent } from './layouts/login/login.component';
import { PageNotFoundComponent } from './layouts/page-not-found/page-not-found.component';
import { HoSoViewportLayoutComponent } from './layouts/viewport/viewport-layout.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { RoleGuard } from './shared/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    // component: AdminLayoutComponent,
    component: DefaultLayoutComponent,
    canActivate: [
      AuthGuard
    ],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }, {
        path: 'home',
        component: HomeComponent,
      }, {
        path: 'QuanTri',
        loadChildren: () => import('./components/quantri/quantri.module').then(m => m.QuanTriModule)
      }
    ]
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'page-not-found',
    component: PageNotFoundComponent
  }, {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
