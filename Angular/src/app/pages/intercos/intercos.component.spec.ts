import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntercosComponent } from './intercos.component';

describe('IntercosComponent', () => {
  let component: IntercosComponent;
  let fixture: ComponentFixture<IntercosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntercosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntercosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
