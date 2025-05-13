import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercicedetailsComponent } from './exercicedetails.component';

describe('ExercicedetailsComponent', () => {
  let component: ExercicedetailsComponent;
  let fixture: ComponentFixture<ExercicedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercicedetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercicedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
