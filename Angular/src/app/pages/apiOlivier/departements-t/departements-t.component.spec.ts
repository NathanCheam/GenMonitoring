import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartementsTComponent } from './departements-t.component';

describe('DepartementsTComponent', () => {
  let component: DepartementsTComponent;
  let fixture: ComponentFixture<DepartementsTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartementsTComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartementsTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
