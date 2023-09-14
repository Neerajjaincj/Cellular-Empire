import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { QuickGameBoardComponent } from './quick-game-board/quick-game-board.component';
import { OfflineGameBoardComponent } from './offline-game-board/offline-game-board.component';
import { LeaderBoardComponent } from './leader-board/leader-board.component';
import { OnlineGameBoardComponent } from './online-game-board/online-game-board.component';
import { GameRulesComponent } from './game-rules/game-rules.component';

const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'home', component: HomeComponent},
  { path: 'help', component: GameRulesComponent},
  { path: 'quick-game', component: QuickGameBoardComponent},
  { path: 'offline-game', component: OfflineGameBoardComponent},
  { path: 'online-game', component: OnlineGameBoardComponent,
    children: [
      { path: '**', component: OnlineGameBoardComponent,}
    ]
  },
  { path: 'leader-board', component: LeaderBoardComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class HomeRoutingModule { }
