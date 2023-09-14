import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, child } from "firebase/database";
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements OnInit{

  playersList:any = {}
  scores:any = []

  constructor(
    private router:Router,
    private gameService: GameService
  ){}

  ngOnInit(){
    this.gameService.initializeFB();
    this.getScores();
  }
  
  getScores(){
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'users')).then((snapshot) => {
      if (snapshot.exists()) {
        this.playersList = snapshot.val()
        this.sortScores();
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  sortScores(){
    var tempArray:any = []
    for(let item in this.playersList ){
      tempArray.push([this.playersList[item]['name'], this.playersList[item]['score'],this.playersList[item]['gameStat']])
    }
    tempArray.sort(function(a: any, b:any) {
      return  b[1] -a[1];
    });
    this.scores = tempArray;
  }

  navToPage(){
    this.router.navigateByUrl("home");
  }
}
