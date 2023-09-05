import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfflineGameBoardComponent } from './offline-game-board.component';

describe('GameBoardComponent', () => {
  let component: OfflineGameBoardComponent;
  let fixture: ComponentFixture<OfflineGameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfflineGameBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfflineGameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
