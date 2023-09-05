import { Injectable } from '@angular/core';

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, child, onValue } from "firebase/database";
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GameService {

    players = {
        player1: {
            name: "User"
        },
        player2: {
            name: "Computer"
        }
    }
    gameConfig ={
        mode:1,
        duration:5,
        difficulty:1
    }
    gameRounds:any = {
        5:[100, 200, 300, 500],
        10:[200, 400, 600, 1000],
        20:[400, 800, 1200, 2000]
    }

    fbDatabase: any;
    activePlayerID = 0;
    hostGameURL = '';

    constructor() {
    }

    resetPlayers() {
        this.players = {
            player1: {
                name: ""
            },
            player2: {
                name: ""
            }
        }
    }

    
    resetGameConfig() {
        this.gameConfig ={
            mode:1,
            duration:1,
            difficulty:1
        }
    }

    initializeFB() {
        let firebaseConfig = {
          databaseURL: environment.firebaseConfig.databaseURL
        };
        let app = initializeApp(firebaseConfig);
        this.fbDatabase = getDatabase(app);
    
      }
}
