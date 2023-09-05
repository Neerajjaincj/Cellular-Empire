import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { getDatabase, ref, set, get, child, onValue } from "firebase/database";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  // game
  rows = 30
  cols = 60
  gameGrid: any;
  intervalId: any;

  // menu
  menu = 1;
  onlineGameMode=0;
  hostGameID = ""
  joinGameID= "";

  player1Name="";
  player2Name="";
  duration = 5
  difficulty = 1
  online = 1

  constructor(
    private router: Router,
    private gameService: GameService
  ){}

  ngOnInit() {


    // game section start
    this.gameGrid = this.createEmptyGrid(this.rows, this.cols);
    // setTimeout(() => {
    // this.playAudio("audio0");
    // }, 5000);
    this.addRandomCells()
    this.addRandomCells()
    this.addRandomCells()
    this.addRandomCells()
    this.playGame();
    // game section end

    // Initialize FB
    this.gameService.initializeFB();

  }


  // game section start
  createEmptyGrid(rows: number, cols: number) {
    let grid = new Array(rows);
    for (let i = 0; i < rows; i++) {
      grid[i] = new Array(cols).fill(0);
    }
    return grid;
  }
  playGame() {
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.runNextGeneration()
    }, 800);
  }
  runNextGeneration() {
    var random = Math.floor(Math.random() * 12)
    if (random % 4 == 0) {
      this.addRandomCells()
    }
    this.gameGrid = this.calculateNextGeneration(this.gameGrid);
  }
  calculateNextGeneration(grid: any) {
    const nextGrid = this.createEmptyGrid(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const cellState = grid[i][j];
        const neighbors = this.countNeighbors(grid, i, j);
        if (cellState === 0 && neighbors === 3) {
          nextGrid[i][j] = 1;
        } else if (cellState === 1 && (neighbors < 2 || neighbors > 3)) {
          nextGrid[i][j] = 0;
        } else {
          nextGrid[i][j] = cellState;
        }
      }
    }
    return nextGrid;
  }
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
  buildMaterial = [
    [[0, -1], [0, 0], [0, 1]], // blinker
    [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 1]], // gliderup
    [[-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]], // gliderdown
    [[0, 0], [0, 1], [1, 0], [1, 1]], // block
    [[-1, 0], [0, -1], [0, 1], [1, 0]], // star
    [[-1, -2], [-1, 1], [0, 2], [1, -2], [1, 2], [2, -1], [2, 0], [2, 1], [2, 2]],//spaceship
    [[-6, -4], [-6, -3], [-6, -2], [-6, 2], [-6, 3], [-6, 4], [-4, -6], [-3, -6],
    [-2, -6], [-4, -1], [-3, -1], [-2, -1], [-4, 1], [-3, 1], [-2, 1], [-4, 6],
    [-3, 6], [-2, 6], [-1, -4], [-1, -3], [-1, -2], [-1, 2], [-1, 3], [-1, 4],
    [1, -4], [1, -3], [1, -2], [1, 2], [1, 3], [1, 4], [2, -6], [3, -6], [4, -6],
    [2, -1], [3, -1], [4, -1], [2, 1], [3, 1], [4, 1], [2, 6], [3, 6], [4, 6],
    [6, -4], [6, -3], [6, -2], [6, 2], [6, 3], [6, 4]],// castle
    [[0, 0]], // life

  ]
  addRandomCells() {
    var inputRow = Math.floor(Math.random() * (this.rows - 16)) + 8
    var inputCol = Math.floor(Math.random() * (this.cols - 16)) + 8
    var buildMode = Math.floor(Math.random() * 8)
    var buildMat = this.buildMaterial[buildMode]
    var pivotValue = 1
    if (inputCol > this.cols / 2) {
      pivotValue = -1
    }
    buildMat.forEach(element => {
      var row = inputRow + element[0]
      var col = inputCol + (element[1] * pivotValue)
      this.gameGrid[row][col] = this.gameGrid[row][col] === 0 ? 1 : 0;
    });
  }
    // game section end
  setMenu(menuNum: number){
    this.menu = menuNum
    this.errorMessage = ''

  }
  errorMessage = ""
  navToGame(gameMode: number) {
    if (gameMode == 1) { // Quick Game
      this.gameService.players.player1.name = this.player1Name || "User";
      this.gameService.players.player2.name = "Computer"
      this.gameService.gameConfig.duration = this.duration; // default
      this.gameService.gameConfig.difficulty = this.difficulty;
      this.gameService.gameConfig.mode = 1;
      this.router.navigateByUrl("quick-game")
    }
    else if(gameMode == 2) { // Multi player
      if (this.player1Name == ""){
        this.errorMessage = "Enter player 1 name !"
      }
      else if (this.player2Name == ""){
        this.errorMessage = "Enter player 2 name !"
      }
      else if(this.player1Name == this.player2Name){
        this.errorMessage = "Use different names"
      }else{
        this.errorMessage = ""
        this.gameService.players.player1.name = this.player1Name;
        this.gameService.players.player2.name = this.player2Name;
        this.gameService.gameConfig.duration = this.duration;
        this.gameService.gameConfig.mode = 2;
        this.router.navigateByUrl("offline-game")
      }
    } else {
      return
    }
  }
  onlineGame(option: number){
    if(option == 1){
      // host game
      if (this.player1Name == ""){
        this.errorMessage = "Enter your name !"
      }else{
        this.errorMessage = ""
        this.hostOnlineGame();
      }
    }else if(option==2){
      // join game
      if (this.player2Name == "") {
        this.errorMessage = "Enter your name !"
      } else if (this.joinGameID == "") {
        this.errorMessage = "Enter Game ID !"
      } else {
        this.errorMessage = ""
        this.checkOnlineGame();
      }
    }else if(option==-1){
      // destroy host game
      this.hostGameID = "";
      this.joinGameID = "";
      this.errorMessage = ""
    }
  }

  hostOnlineGame(){

    this.hostGameID = new Date().getTime().toString().slice(-9,-3);
    var playerData = {
            name: this.player1Name,
            score:0,
            status:"",
            message:"",
            duration: this.duration
          }

    var hostURL = "games/"+this.hostGameID;
    let playerSetRef = set(ref(this.gameService.fbDatabase, hostURL +"/player/1"), playerData);

    // FB triggers after updates
    const gameRef = ref(this.gameService.fbDatabase, hostURL +"/player");
    onValue(gameRef, (snapshot:any) => {
      if (snapshot.exists()) {
        var players = snapshot.val()
        if(players[1] && players[2]){
          this.gameService.players.player1.name = this.player1Name;
          this.gameService.players.player2.name = players[2].name;
          this.gameService.gameConfig.duration = this.duration;
          this.gameService.gameConfig.mode = 2;
          this.gameService.activePlayerID = 1;
          this.gameService.hostGameURL = hostURL;
          this.router.navigateByUrl("online-game");
        }
      }
    });

  }

  checkOnlineGame(){
    var hostURL = "games/"+this.joinGameID;
    const dbRef = ref(getDatabase());
    get(child(dbRef, hostURL + "/player")).then((snapshot) => {
      if (snapshot.exists()) {
        var players = snapshot.val()
        if(players.length == 0){
          this.errorMessage = "Wrong Game ID!"
        } else if(players[2]){
          this.errorMessage = "Game room is full!"
        }else{
          this.joinOnlineGame(hostURL)
        }
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  joinOnlineGame(hostURL: string){
    var playerData = {
      name: this.player2Name,
      score:0,
      status:"",
      message:"",
      duration: this.duration
    }

    let abc = set(ref(this.gameService.fbDatabase, hostURL +"/player/2"), playerData);

    // FB triggers after updates
    const starCountRef = ref(this.gameService.fbDatabase, hostURL+"/player");
    onValue(starCountRef, (snapshot:any) => {
      if (snapshot.exists()) {
        var players = snapshot.val()
        if(players[1] && players[2]){
          this.gameService.players.player1.name = players[1].name;
          this.gameService.players.player2.name = this.player2Name;
          this.gameService.gameConfig.duration = this.duration;
          this.gameService.gameConfig.mode = 2;
          this.gameService.activePlayerID = 2;
          this.gameService.hostGameURL = hostURL;
          this.router.navigateByUrl("online-game");
        }
      }
    });
  }

  navToPage(){
    this.router.navigateByUrl("leader-board");
  }




}
