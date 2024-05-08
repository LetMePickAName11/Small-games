import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureInputComponent } from './configure-input.component';

describe('ConfigureInputComponent', () => {
  let component: ConfigureInputComponent;
  let fixture: ComponentFixture<ConfigureInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureInputComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
