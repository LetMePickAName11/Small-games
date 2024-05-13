import { Component, OnDestroy } from '@angular/core';
import { Subscription, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WebSocketService } from '../../../services/web-socket.service';
import { BitAllocation } from 'shared-lib';

@Component({
  selector: 'app-configure-configuration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configure-configuration.component.html',
  styleUrl: './configure-configuration.component.scss'
})
export class ConfigureConfigurationComponent implements OnDestroy {
    public readonly maxBits: number = 256;
    private readonly bitAllocationColorMap = new Map([
      [1, 'rgb(153, 204, 153)'],   //# Green
      [2, 'rgb(102, 178, 153)'],   //# Green-cyan
      [3, 'rgb(51, 153, 153)'],    //# Dark cyan
      [4, 'rgb(0, 128, 153)'],     //# Dark blue-green
      [5, 'rgb(0, 102, 153)'],     //# Blue
      [6, 'rgb(0, 76, 102)'],      //# Dark blue
      [7, 'rgb(51, 51, 102)'],     //# Indigo
      [8, 'rgb(51, 0, 102)'],      //# Deep purple
      [9, 'rgb(102, 0, 102)'],     //# Dark purple
      [10, 'rgb(153, 0, 102)'],    //# Purple-magenta
      [11, 'rgb(153, 0, 51)'],     //# Dark magenta
      [12, 'rgb(153, 0, 0)'],      //# Red
      [13, 'rgb(128, 0, 0)'],      //# Dark red
      [14, 'rgb(102, 0, 0)'],      //# Darker red
      [15, 'rgb(77, 0, 0)'],       //# Near black red
      [16, 'rgb(51, 0, 0)']        //# Darkest red
    ]);
  
    public bitsUsed: number = 0;
    public hover: any = null;
    public click: any = null;
    public bitAllocations: Array<BitAllocationData> = [
      {
        size: 256,
        name: "Unused bits",
        objectNames: [],
        shaderParameters: [],
        range: {
          start: 0,
          end: 0
        },
        lsbName: "",
        msbName: "",
        bitIndex: 0,
        id: Date.now() + '_' + Math.random() + Math.random() * Math.random(),
        color: 'rgb(255, 255, 255)',
        width: (this.maxBits - this.bitsUsed) / this.maxBits * 200 + '%' // (256 - this.bitsUsed) / 256 * 100 * 2 + '%'
      }
    ];
  
  
    private subscriptions: Array<Subscription> = [];
  
  
    constructor(private webSocketService: WebSocketService) {
      this.subscriptions.push(
        this.webSocketService.$configuration.pipe(
          tap((configurations: Array<BitAllocation>) => {
            const mappedResult: Array<BitAllocationData> = configurations.map((configuration: BitAllocation) => {
              return {
                ...configuration,
                id: Date.now() + '_' + Math.random() + Math.random() * Math.random(),
                color: this.getBitAllocationColor(configuration.size),
                width: configuration.size / this.maxBits * 200 + '%' // c.size / 256 * 100 * 2 + '%'
              }
            });
  
            this.bitsUsed = this.bitAllocations.reduce((acc, v) => acc + v.size, 0);
  
            mappedResult.push({
              size: this.maxBits - this.bitsUsed,
              name: "Unused bits",
              objectNames: [],
              shaderParameters: [],
              range: {
                start: 0,
                end: 0
              },
              lsbName: "",
              msbName: "",
              bitIndex: 0,
              id: Date.now() + '_' + Math.random() + Math.random() * Math.random(),
              color: 'rgb(255, 255, 255)',
              width: (this.maxBits - this.bitsUsed) / this.maxBits * 200 + '%' // (256 - this.bitsUsed) / 256 * 100 * 2 + '%'
            });
  
            return mappedResult;
          })
        ).subscribe()
      );
    }
  
  
    public ngOnDestroy(): void {
      this.subscriptions.forEach((sub: Subscription) => sub?.unsubscribe());
    }
  
    public onMouseEnter(e: any): void {
      this.hover = e;
    }
  
    public onMouseLeave(e: any): void {
      this.hover = null;
    }
  
    public onclick(e: any): void {
      this.click = e;
    }
  
    private getBitAllocationColor(index: number): string {
      if (!this.bitAllocationColorMap.has(index)) {
        return 'rgb(0, 0, 0)';
      }
  
      return this.bitAllocationColorMap.get(index)!;
    }
  }
  
  
  interface BitAllocationData extends BitAllocation {
    id: string;
    color: string;
    width: string;
  }