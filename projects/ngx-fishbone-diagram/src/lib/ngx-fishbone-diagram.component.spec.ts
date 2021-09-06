import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFishboneDiagramComponent } from './ngx-fishbone-diagram.component';

describe('NgxFishboneDiagramComponent', () => {
  let component: NgxFishboneDiagramComponent;
  let fixture: ComponentFixture<NgxFishboneDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxFishboneDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFishboneDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
