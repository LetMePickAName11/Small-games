import { Component, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Configuration } from '../../models/configuration';
import { Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configure.component.html',
  styleUrl: './configure.component.scss'
})
export class ConfigureComponent implements OnDestroy {

  private configurations: Array<Configuration> | null = null;

  public bitsUsed: number = 0;

  public myForm = new FormGroup({
    form: new FormArray([
      new FormGroup({
        size: new FormControl(),
        type: new FormControl(),
        name: new FormControl(),
        objectNames: new FormArray([new FormControl<string>("")]),
        shaderParameters: new FormArray([new FormControl<string>("")]),
        range: new FormGroup({
          start: new FormControl(),
          end: new FormControl()
        }),
        startName: new FormControl(),
        endName: new FormControl(),
        bitIndex: new FormControl(),
      })
    ])
  });

  get form(): FormArray {
    return this.myForm.get('form') as FormArray;
  }

  getObjectNames(index: number): FormArray {
    return this.form.at(index).get('objectNames') as FormArray;
  }

  getShaderParameters(index: number): FormArray {
    return this.form.at(index).get('shaderParameters') as FormArray;
  }


  private subscriptions: Array<Subscription> = [];

  constructor(private webSocketService: WebSocketService) {
    webSocketService.configurationUpdates.pipe(
      tap((configurations: Array<Configuration>) => this.configurations = configurations),
      tap((configurations: Array<Configuration>) => this.myForm.controls.form = this.generateFormArray(configurations)),
      tap((configurations: Array<Configuration>) => this.bitsUsed = configurations.reduce((acc: number, config: Configuration) => acc + config.size, 0)))
      .subscribe();
  }


  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => sub?.unsubscribe());
  }


  public saveChanges(): void {
    if (this.bitsUsed > 256) {
      return;
    }

    this.webSocketService.updateConfigurations(this.form.getRawValue());
  }

  public addNewConfiguration(): void {

  }

  public resetForm(): void {
    this.myForm.controls.form = this.generateFormArray(this.configurations!);
  }

  private generateFormArray(configurations: Array<Configuration>) {
    return new FormArray(configurations.map((configuration: Configuration) => new FormGroup({
      size: new FormControl<number>(configuration.size),
      type: new FormControl<'i' | 'b'>(configuration.type),
      name: new FormControl<string>(configuration.name),
      objectNames: new FormArray(configuration.objectNames.map((objectName: string) => new FormControl<string>(objectName))),
      shaderParameters: new FormArray(configuration.shaderParameters.map((shaderParameter: string) => new FormControl<string>(shaderParameter))),
      range: new FormGroup({
        start: new FormControl(),
        end: new FormControl()
      }),
      startName: new FormControl(configuration.startName),
      endName: new FormControl(configuration.endName),
      bitIndex: new FormControl(configuration.bitIndex),
    }))
    );
  }
}
