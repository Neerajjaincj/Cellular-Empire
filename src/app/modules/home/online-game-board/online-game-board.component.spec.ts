import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineGameBoardComponent } from './online-game-board.component';

describe('OnlineGameBoardComponent', () => {
  let component: OnlineGameBoardComponent;
  let fixture: ComponentFixture<OnlineGameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnlineGameBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlineGameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
