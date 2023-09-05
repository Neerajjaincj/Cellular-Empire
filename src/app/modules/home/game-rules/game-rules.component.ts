import { Component } from '@angular/core';

@Component({
  selector: 'app-game-rules',
  templateUrl: './game-rules.component.html',
  styleUrls: ['./game-rules.component.scss']
})
export class GameRulesComponent {

  tools = [
    {name:"Blinker", icon:"tool_blinker.png", type:"Defence", points:3, desc:"This is a static tool, it oscillate in a fixed position."},
    {name:"Block", icon:"tool_block.png", type:"Defence", points:4,  desc:"This is a static tool. "},
    {name:"Star", icon:"tool_star.png", type:"Defence", points:4,  desc:"This is a static tool. "},
    {name:"Glider Up", icon:"tool_glider_up.png", type:"Weapon", points:5,  desc:"This is a moving tool, it moves diagonally upwards."},
    {name:"Glider Down", icon:"tool_glider_down.png", type:"Weapon", points:5,  desc:"This is a moving tool, it moves diagonally downwards. "},
    {name:"Spaceship", icon:"tool_spaceship.png", type:"Weapon", points:9,  desc:"This is a moving tool, it moves straight to opponents area. "},
    {name:"Pulsar", icon:"tool_pulsar.png", type:"Reinforcement", points:48,  desc:"This is a static oscillating tool. with high number of living cells."},
  ]
}
