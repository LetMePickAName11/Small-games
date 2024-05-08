import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureConfigurationComponent } from './configure-configuration.component';

describe('ConfigureConfigurationComponent', () => {
  let component: ConfigureConfigurationComponent;
  let fixture: ComponentFixture<ConfigureConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureConfigurationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
