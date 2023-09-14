import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home/home.component';
import { QuickGameBoardComponent } from './quick-game-board/quick-game-board.component';
import { OfflineGameBoardComponent } from './offline-game-board/offline-game-board.component';
import { OnlineGameBoardComponent } from './online-game-board/online-game-board.component';
import { LeaderBoardComponent } from './leader-board/leader-board.component';

import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { GameRulesComponent } from './game-rules/game-rules.component';

@NgModule({
  declarations: [
    HomeComponent,
    QuickGameBoardComponent,
    OfflineGameBoardComponent,
    OnlineGameBoardComponent,
    LeaderBoardComponent,
    GameRulesComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,

    TooltipModule,
    ProgressBarModule,
  ]
})
export class HomeModule { }
