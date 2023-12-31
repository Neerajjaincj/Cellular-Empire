import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { easy1, medium1, hard1 } from '../models/gamePreset.model';

import { getDatabase, ref, set, get, child } from "firebase/database";

@Component({
  selector: 'app-quick-game-board',
  templateUrl: './quick-game-board.component.html',
  styleUrls: ['./quick-game-board.component.scss']
})
export class QuickGameBoardComponent implements OnInit {

  buildMode = 0;
  buildMaterial = [
    [[0, -1], [0, 0], [0, 1]], // blinker
    [[0, 0], [0, 1], [1, 0], [1, 1]], // block
    [[-1, 0], [0, -1], [0, 1], [1, 0]], // star
    [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 1]], // gliderup
    [[-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]], // gliderdown
    [[-1, -2], [-1, 1], [0, 2], [1, -2], [1, 2], [2, -1], [2, 0], [2, 1], [2, 2]], // spaceship
    [[-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4], [-4, -6], [-3, -6],
    [-2, -6], [-4, -1], [-3, -1], [-2, -1], [-4, 1], [-3, 1], [-2, 1], [-4, 6],
    [-3, 6], [-2, 6], [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
    [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4], [2, -6], [3, -6], [4, -6],
    [2, -1], [3, -1], [4, -1], [2, 1], [3, 1], [4, 1], [2, 6], [3, 6], [4, 6],
    [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4]], // pulsar
    [[0, 0]], // life

  ]

  actionTool = ["Edit", "Undo", "Reset"];
  actionToolIcon = ["pi-pencil", "pi-undo", "pi-times"];
  buildMaterialName = ["Blinker", "Block", "Star", "Glider Up", "Glider Down", "Spaceship", "Pulsar"];
  buildMaterialIcon = ["pi-eye", "pi-table", "pi-home", "pi-send rotate", "pi-send rotate-90", "pi-share-alt", "pi-shield"]
  buildMaterialCountDefault = [8, 8, 8, 4, 4, 4, 2, 25];
  buildMaterialCount1 = [];
  buildMaterialCount2 = [];
  gameContainer: any;
  count1Display = 0;
  count2Display = 0;
  born1 = 0;
  born2 = 0;
  death1 = 0;
  death2 = 0;
  rows = 40
  cols = 90;
  gameStatus = "start";
  gameGrid: any;

  game1Active = true;
  game2Active = true;
  intervalId: any;

  generationCount = 0;
  gameDuration = 500;
  gameRound = 1;
  gameRoundLimit = 4;
  generationsPerRound = [100, 200, 300, 500]
  generationLimit = this.generationsPerRound[this.gameRound-1];

  controlButton = 0;
  menuButton = ["pi-play", "pi-replay", "pi-volume-up", "pi-question-circle", "pi-sign-out", '1x']
  gameSpeed:any = { '0.5x':1000, '1x':500, '2x':250, '5x':100 }
  buildHistory: Array<Array<number>> = [];

  player1Lock = false;
  player2Lock = false;
  lockCounterDefault = 60 // sec
  lockCounter = this.lockCounterDefault

  player1Name = "User";
  player2Name = "Computer";

  showResult = false;
  showHelp = false;
  fbDatabase: any;

  happySmileyArray = ['happy.svg','happy_smile.svg','happy_love.svg'];
  sadSmileyArray = ['sad.svg','sad_cry.svg','sad_angry.svg'];
  player1Smiley = this.happySmileyArray[0];
  player2Smiley = this.happySmileyArray[0];
  assetPath = "../../../../assets/"
  player1Message = "Select the lock to unlock for "+this.lockCounterDefault+" Sec"
  player2Message = "Select the lock to unlock for "+this.lockCounterDefault+" Sec"

  player1buildComplete = false;
  player2buildComplete = false;

  constructor(
    private router: Router,
    private gameService: GameService
  ) { }
  ngOnInit() {
    this.initPage();
    this.gameService.initializeFB();
  }

  initPage() {
    this.player1Name = this.gameService.players.player1.name;
    this.player2Name = this.gameService.players.player2.name;
    this.gameDuration = this.gameService.gameConfig.duration * 100;
    this.generationsPerRound = this.gameService.gameRounds[this.gameService.gameConfig.duration];
    this.generationLimit = this.generationsPerRound[this.gameRound-1];
    this.buildMaterialCount1 = JSON.parse(JSON.stringify(this.buildMaterialCountDefault));
    this.buildMaterialCount2 = JSON.parse(JSON.stringify(this.buildMaterialCountDefault));

    this.gameGrid = this.createEmptyGrid(this.rows, this.cols);

    setTimeout(() => {
      this.initGame();
    }, 1000);

    setTimeout(() => {
      this.playAudio("audio0");
    }, 3000);

  }

  lockIntervalId: any;
  initGame() {
    // user vs computer
    if (this.gameService.gameConfig.mode == 1) {
      var tempGameGrid:any = []
      if (this.gameService.gameConfig.difficulty == 1) { tempGameGrid = easy1; }
      if (this.gameService.gameConfig.difficulty == 2) { tempGameGrid = medium1; }
      if (this.gameService.gameConfig.difficulty == 3) { tempGameGrid = hard1; }
      this.gameGrid = JSON.parse(JSON.stringify(tempGameGrid));
      this.updateGrid(this.gameGrid)
      this.countLivingCells(this.gameGrid)
      this.player1Message = "Build your empire"
      this.player2Message = "Build your empire"
    } else {
      // multi player
      this.player1Lock = true;
      this.player2Lock = true;
    }
  }

  unblockSection(playerSection: number){
    if(playerSection == 1){
      this.player1Message = "Build your empire !"
      this.buildGame1(1);
      this.player1Lock = false;
      this.player2Lock = true;
    }
    if(playerSection == 2){
      this.player2Message = "Build your empire !"
      this.buildGame1(2);
      this.player1Lock = true;
      this.player2Lock = false;
    }
  }
  

  buildGame1(playerNumber: number) {
    clearInterval(this.lockIntervalId);
    this.lockIntervalId = setInterval(() => {
      if (this.lockCounter <= 0) {
        this.lockCounter = this.lockCounterDefault
        clearInterval(this.lockIntervalId);
        if(playerNumber == 1){this.player1buildComplete= true}
        else if(playerNumber == 2){this.player2buildComplete= true}
        this.buildComplete()
      }
      else {
        this.lockCounter--
      }
    }, 1000);
  }

  buildComplete() {
    clearInterval(this.lockIntervalId);
    this.player1Lock = true;
    this.player2Lock = true;
  }


  // Create an empty grid
  createEmptyGrid(rows: number, cols: number) {
    let grid = new Array(rows);
    for (let i = 0; i < rows; i++) {
      grid[i] = new Array(cols).fill(0);
    }
    return grid;
  }

  counter(count: number) {
    return new Array(count)
  }

  mute = false;
  pauseAudio() {
    this.mute = true;
    const audio: any = document.getElementById("audio0");
    audio.pause();
  }

  // Toggle the state of a cell

  selectActionTool(index: number) {
    this.playAudio('audio5')

    if (index == 7) {
      this.buildMode = index;
      this.editBuild(index)
    }
    else if (index == 8) {
      this.undoLastBuild()
    }
    else if (index == 9) {
      this.resetBuild()
    }

  }

  editBuild(index: number) {
    this.selectBuildMode(index)
  }
  undoLastBuild() {

    var lastBuild = this.buildHistory[this.buildHistory.length - 1];
    this.toggleCell(lastBuild[1], lastBuild[2], lastBuild[0], true);
    this.buildHistory.pop()

  }
  resetBuild() {
    // clear all living cells
  }


  selectBuildMode(index: number) {
    if (this.buildMode != index) {
      this.buildMode = index;
      this.playAudio('audio5')
    }
  }
  toggleCell(inputRow: number, inputCol: number, buildMode = this.buildMode, undo = false) {
    if(this.gameStatus == 'play'){
      return;
    }
    if (inputCol < this.cols / 2) {
      if(undo){
        this.buildMaterialCount1[buildMode]++
      } else {
        if(this.buildMaterialCount1[buildMode]<=0){
          return;
        }else{
          this.buildMaterialCount1[buildMode]--
        }
      }
    }
    else{
      if(undo){
        this.buildMaterialCount2[buildMode]++
      } else {
        if(this.buildMaterialCount2[buildMode]<=0){
          return;
        }else{
          this.buildMaterialCount2[buildMode]--
        }
      }
    }

    var buildMat = this.buildMaterial[buildMode]
    var pivotValue = 1
    if (inputCol > this.cols / 2) {
      pivotValue = -1
    }
    buildMat.forEach(element => {
      var row = inputRow + element[0]
      var col = inputCol + (element[1] * pivotValue)
      this.gameGrid[row][col] = this.gameGrid[row][col] === 0 ? 1 : 0;
      var cell: any = document.getElementById("game_" + row + "_" + col)

      var rdm1 = Math.floor(Math.random() * 40 + 16).toString(16);
      var rdm2 = Math.floor(Math.random() * 80 + 16).toString(16);
      var rdm3 = Math.floor(Math.random() * 100 + 16).toString(16);
      var color1 = "#" + "E7" + rdm2 + rdm1
      var color2 = "#" + rdm3 + "B9" + rdm2
      if (col < this.cols / 2) {
        // cell.style.backgroundColor = this.gameGrid[row][col] === 0 ? "#0001" : color1;
        cell.style.backgroundColor = this.gameGrid[row][col] === 0 ? "#1D2738" : color1;
      }
      else {
        cell.style.backgroundColor = this.gameGrid[row][col] === 0 ? "#1D2738" : color2;
      }


    });


    // Update living cell count for the respective player
    this.countLivingCells(this.gameGrid);


    // const audio:any = document.querySelector("audio");

    if (undo == false) {
      this.playAudio("audio1")
      this.buildHistory.push([buildMode, inputRow, inputCol])
    }

  }

  // Count the number of living cells in the grid
  countLivingCells(grid: any) {
    let count1 = 0;
    let count2 = 0;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        if (grid[i][j] === 1) {
          if (j < this.cols / 2) {
            count1++;
          }
          else {
            count2++;
          }
        }
      }
    }

    // dead cell
    if (this.count1Display - count1 > 20 && this.count2Display - count2 > 20) {
      this.playAudio("audio3")
    }

    if(this.generationCount%10 == 0){
      this.smileyUpdates(count1, count2);
    }

    this.count1Display = count1
    this.count2Display = count2
  }

  smileyUpdates(count1:number, count2:number) {
    if(this.gameStatus != 'play'){
      return;
    }
    var scoreDifference = count1 - count2;
    if(scoreDifference == 0){
      this.player1Smiley = this.happySmileyArray[0];
      this.player2Smiley = this.happySmileyArray[0];
      this.tempMessageUpdate("Build your empire!", "Build your empire!");
    }
    else if(scoreDifference > 0){
      if(scoreDifference > 80){
        this.player1Smiley = this.happySmileyArray[2];
        this.player2Smiley = this.sadSmileyArray[2];
        this.tempMessageUpdate("I love this game!", "I want to win!");
      }
      else if(scoreDifference > 40){
        this.player1Smiley = this.happySmileyArray[1];
        this.player2Smiley = this.sadSmileyArray[1];
        this.tempMessageUpdate("Nice!", "Don't laugh, I am gonna win this game!");
      }
      else{
        this.player1Smiley = this.happySmileyArray[0];
        this.player2Smiley = this.sadSmileyArray[0];
        this.tempMessageUpdate("Hehe...", "Don't laugh!");
      }
    } else if(scoreDifference < 0){
      if(scoreDifference < -80){
        this.player1Smiley = this.sadSmileyArray[2];
        this.player2Smiley = this.happySmileyArray[2];
        this.tempMessageUpdate("I want to win!", "I love this game!");
      }
      else if(scoreDifference < -40){
        this.player1Smiley = this.sadSmileyArray[1];
        this.player2Smiley = this.happySmileyArray[1];
        this.tempMessageUpdate("Ohh no I am loosing!", "Nice!");
      }
      else{
        this.player1Smiley = this.sadSmileyArray[0];
        this.player2Smiley = this.happySmileyArray[0];
        this.tempMessageUpdate("Don't laugh, I am gonna win this game!", "Hehe...");
      }
    }
  }
  tempMessageUpdate(player1msg: string, player2msg: string){
    if(player1msg){
      this.player1Message = player1msg;
    }
    if(player2msg){
      this.player2Message = player2msg;
    }
  }

  // Update the grid with the next generation of cells
  updateGrid(grid: any) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let cell: any = document.getElementById("game_" + i + "_" + j);
        var rdm1 = Math.floor(Math.random() * 40 + 16).toString(16);
        var rdm2 = Math.floor(Math.random() * 80 + 16).toString(16);
        var rdm3 = Math.floor(Math.random() * 100 + 16).toString(16);
        var color1 = "#" + "E7" + rdm2 + rdm1
        var color2 = "#" + rdm3 + "B9" + rdm2
        if (j < this.cols / 2) {
          // cell.style.backgroundColor = grid[i][j] === 0 ? "#0000" : "#E72E59";
          cell.style.backgroundColor = grid[i][j] === 0 ? "#1D2738" : color1;
        }
        else {
          // cell.style.backgroundColor = grid[i][j] === 0 ? "#0000" : "#4CB931";
          cell.style.backgroundColor = grid[i][j] === 0 ? "#1D2738" : color2;
        }
      }
    }
  }

  // Calculate the next generation of cells based on the rules of the game
  calculateNextGeneration(grid: any) {
    const nextGrid = this.createEmptyGrid(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cellState = grid[i][j];
        const neighbors = this.countNeighbors(grid, i, j);

        if (cellState === 0 && neighbors === 3) {
          nextGrid[i][j] = 1;
          if (j < this.cols / 2) { this.born2++ }
          else { this.born1++ }
        } else if (cellState === 1 && (neighbors < 2 || neighbors > 3)) {
          nextGrid[i][j] = 0;
          if (j < this.cols / 2) { this.death2++ }
          else { this.death1++ }
        } else {
          nextGrid[i][j] = cellState;
        }
      }
    }
    return nextGrid;
  }

  // Count the number of live neighbors around a cell
  countNeighbors(grid: any, row: number, col: number) {
    let count = 0;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (let i = 0; i < directions.length; i++) {
      const [dx, dy] = directions[i];
      const neighborRow = (row + dx + this.rows) % this.rows;
      const neighborCol = (col + dy + this.cols) % this.cols;
      count += grid[neighborRow][neighborCol];
    }
    return count;
  }

  // Run the game
  
  runNextGeneration() {
    if (this.generationCount >= this.generationLimit) {
      if(this.gameRound == this.gameRoundLimit){
        this.pauseGame();
        this.gameEnd(); 
      }
      else{
        this.pauseGame();
        this.gameRound++;
        this.generationLimit = this.generationsPerRound[this.gameRound-1];
      }
    }
    else {
      this.generationCount++;
      this.updateProgressBar(this.generationCount)
      this.gameGrid = this.calculateNextGeneration(this.gameGrid);
      this.updateGrid(this.gameGrid);
      // Update living cell count for each player
      this.countLivingCells(this.gameGrid);
    }
  }

  gameEnd() {
    this.showResult = true;
    this.updateScore(this.player1Name, this.count1Display, this.count2Display);
    this.updateScore(this.player2Name, this.count2Display, this.count1Display);
  }

  updateProgressBar(generationCount: number) {

    var percentageComplete = generationCount / (this.gameDuration * 1);
    var fillWidth = percentageComplete * 15
    var progressBar: any = document.getElementById('progress-bar-fill');
    progressBar.style.width = fillWidth + "rem";

  }

  // Play the game
  playGame() {

    if (this.generationCount >= this.generationLimit) {
      // reset
    }
    clearInterval(this.intervalId);
    var gameSpeed = this.gameSpeed[this.menuButton[5]]
    this.intervalId = setInterval(() => {
      this.runNextGeneration();
    }, gameSpeed);

    this.gameStatus = 'play';

    this.playAudio("audio2")
    this.buildHistory = []
    this.menuButton[0] = "pi-pause"

  }

  // Pause the game
  pauseGame() {
    this.menuButton[0] = "pi-play"
    this.gameStatus = "start";
    clearInterval(this.intervalId);
  }

  // Reset the game
  resetGame() {
    this.pauseGame()
    this.generationCount = 0
    this.gameRound = 1;
    this.generationLimit = this.generationsPerRound[this.gameRound-1];
    this.game1Active = true;
    this.game2Active = true;
    this.gameGrid = this.createEmptyGrid(this.rows, this.cols);
    this.updateGrid(this.gameGrid);
    this.buildHistory = []

    this.born1 = this.born2 = this.death1 = this.death2 = 0
    this.showResult = false;

    this.count1Display = this.count2Display = 0;

    this.player1buildComplete = this.player2buildComplete = false;

    this.menuButton[0] = "pi-play";

    this.smileyUpdates(0,0);

    this.buildMaterialCount1 = JSON.parse(JSON.stringify(this.buildMaterialCountDefault));
    this.buildMaterialCount2 = JSON.parse(JSON.stringify(this.buildMaterialCountDefault));
  }

  playAudio(audioName: string) {
    if(this.mute == false){
      const audio: any = document.getElementById(audioName);
      audio.volume = 0.2;
      audio.play();
    }
  }
  menuAction(action: number) {
    if (action == 1) {
      if (this.menuButton[0] == "pi-play") {
        this.menuButton[0] = "pi-pause"
        this.playGame();
      }
      else {
        this.menuButton[0] = "pi-play"
        this.pauseGame();
      }
    } else if (action == 2) {
      this.resetGame();
    } else if (action == 3) {
      if (this.menuButton[2] == 'pi-volume-up') {
        this.menuButton[2] = 'pi-volume-off'
        this.pauseAudio();
      }
      else { 
        this.menuButton[2] = 'pi-volume-up';
        this.mute = false;
        this.playAudio("audio0");
      }
    } else if (action == 4) {
      this.showHelp = true;
    } else if (action == 5) {
      this.router.navigateByUrl('home')
    } else if (action == 6) {
      if(this.menuButton[5] == '0.5x'){this.menuButton[5] = '1x'}
      else if(this.menuButton[5] == '1x'){this.menuButton[5] = '2x'}
      else if(this.menuButton[5] == '2x'){this.menuButton[5] = '5x'}
      else if(this.menuButton[5] == '5x'){this.menuButton[5] = '0.5x'}
      if(this.menuButton[0] == "pi-pause"){
        this.pauseGame();
        this.playGame();
      }
    } else { return }
  }



  updateScore(playerName: string, currentScore: number, opponentScore: number) {
    const dbRef = ref(getDatabase());
    var MP = 1, W = 0, D = 0, L = 0;
    if (currentScore == opponentScore) { D = 1 }
    if (currentScore > opponentScore) { W = 1 }
    if (currentScore < opponentScore) { L = 1 }

    get(child(dbRef, 'users/' + playerName)).then((snapshot) => {
      if (snapshot.exists()) {
        var player = snapshot.val()
        var gameStat = player['gameStat']
        gameStat[0] += 1;
        gameStat[1] += W;
        gameStat[2] += D;
        gameStat[3] += L;
        if (currentScore > player['score']) {
          this.writeFB(playerName, currentScore, gameStat);
        }
        else {
          this.writeFB(playerName, player['score'], gameStat);
        }
      } else {
        console.log("No data available");
        this.writeFB(playerName, currentScore, [MP, W, D, L]);
      }
    }).catch((error) => {
      console.error(error);
    });
  }
  // gameStat : [MP, W, D, L]
  writeFB(playerName: string, score: number, gameStat: Array<number>) {
    let abc = set(ref(this.fbDatabase, 'users/' + playerName), {
      name: playerName,
      score: score,
      gameStat: gameStat
    });
  }

  navToPage() {
    this.router.navigateByUrl("leader-board");
  }

}
