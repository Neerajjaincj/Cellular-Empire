import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomPreloadingWithDelayStrategy } from 'src/app/configurations/CustomPreloadingWithDelayStrategy.preload';

const routes: Routes = [
  { path: '', loadChildren: () => import('src/app/modules/home/home.module').then(m => m.HomeModule), data: { preload: true }  },
  // { path: '**', redirectTo: ''}
  // { path: '**', redirectTo: ''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: CustomPreloadingWithDelayStrategy
    , onSameUrlNavigation: "reload"
  })],
  exports: [RouterModule],
  providers: [CustomPreloadingWithDelayStrategy]
})

export class AppRoutingModule { }
