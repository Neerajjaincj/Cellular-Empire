import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'cellular-empire';

  ngOnInit(){

    var screenWidth = window.innerWidth;
    if(screenWidth < 1708){
      var mainContainer: any = document.getElementById("app-container");
      
      var zoom = (screenWidth-20) / 1708;
      mainContainer.style= "zoom:"+zoom+";";
    }

  }


}
