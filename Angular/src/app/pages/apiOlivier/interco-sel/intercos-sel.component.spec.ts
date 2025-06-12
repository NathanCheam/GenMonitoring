import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercosSelComponent } from './intercos-sel.component';

describe('IntercoSelComponent', () => {
  let component: IntercosSelComponent;
  let fixture: ComponentFixture<IntercosSelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntercosSelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntercosSelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
