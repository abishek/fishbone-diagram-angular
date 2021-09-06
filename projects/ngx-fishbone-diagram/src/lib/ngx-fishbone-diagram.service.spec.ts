import { TestBed } from '@angular/core/testing';

import { NgxFishboneDiagramService } from './ngx-fishbone-diagram.service';

describe('NgxFishboneDiagramService', () => {
  let service: NgxFishboneDiagramService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFishboneDiagramService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
