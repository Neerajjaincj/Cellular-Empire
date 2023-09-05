import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickGameBoardComponent } from './quick-game-board.component';

describe('GameBoardComponent', () => {
  let component: QuickGameBoardComponent;
  let fixture: ComponentFixture<QuickGameBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickGameBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickGameBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
