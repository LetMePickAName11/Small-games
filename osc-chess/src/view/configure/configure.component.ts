import { Component, OnDestroy } from '@angular/core';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configure.component.html',
  styleUrl: './configure.component.scss'
})
export class ConfigureComponent implements OnDestroy {
  // TODO
  // Fetch data from websocket service
  // Improve visuals
  // Ensure fetch and update works
  // Build files via button

  public bitsUsed: number = 0;
  public maxBits: number = 256;
  public hover: any = null;
  public click: any = null;
  public bitArray: Array<any> = [];

  private a = new Map([
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
  private subscriptions: Array<Subscription> = [];

  private b(index: number): string{
    if(!this.a.has(index)){
      return 'rgb(0, 0, 0)';
    }

    return this.a.get(index)!;
  }

  constructor(private webSocketService: WebSocketService) {
    //this.subscriptions.push(
    //  this.webSocketService.$configuration.pipe(
    //    tap((configurations: Array<Configuration>) => {
    //      this.bitArray = configurations.map((c) => c);
    //    })
    //  ).subscribe()
    //);

    
    this.bitArray = [
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_1_Promotion",
        "objectNames": [
          "Pawn_White_1/Pawn",
          "Pawn_White_1/Queen",
          "Pawn_White_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 0,
          "end": 2
        },
        "startName": "0_MSBEightBit",
        "endName": "0_MSBMiddleEightBit",
        "bitIndex": 0
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_2_Promotion",
        "objectNames": [
          "Pawn_White_2/Pawn",
          "Pawn_White_2/Queen",
          "Pawn_White_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 2,
          "end": 4
        },
        "startName": "0_MSBEightBit",
        "endName": "0_MSBMiddleEightBit",
        "bitIndex": 2
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_3_Promotion",
        "objectNames": [
          "Pawn_White_3/Pawn",
          "Pawn_White_3/Queen",
          "Pawn_White_3/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 4,
          "end": 6
        },
        "startName": "0_MSBEightBit",
        "endName": "0_MSBMiddleEightBit",
        "bitIndex": 4
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_4_Promotion",
        "objectNames": [
          "Pawn_White_4/Pawn",
          "Pawn_White_4/Queen",
          "Pawn_White_4/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 6,
          "end": 8
        },
        "startName": "0_MSBEightBit",
        "endName": "0_MSBMiddleEightBit",
        "bitIndex": 6
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_5_Promotion",
        "objectNames": [
          "Pawn_White_5/Pawn",
          "Pawn_White_5/Queen",
          "Pawn_White_5/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 8,
          "end": 10
        },
        "startName": "0_MSBMiddleEightBit",
        "endName": "0_LSBMiddleEightBit",
        "bitIndex": 8
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_6_Promotion",
        "objectNames": [
          "Pawn_White_6/Pawn",
          "Pawn_White_6/Queen",
          "Pawn_White_6/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 10,
          "end": 12
        },
        "startName": "0_MSBMiddleEightBit",
        "endName": "0_LSBMiddleEightBit",
        "bitIndex": 10
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_7_Promotion",
        "objectNames": [
          "Pawn_White_7/Pawn",
          "Pawn_White_7/Queen",
          "Pawn_White_7/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 12,
          "end": 14
        },
        "startName": "0_MSBMiddleEightBit",
        "endName": "0_LSBMiddleEightBit",
        "bitIndex": 12
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_White_8_Promotion",
        "objectNames": [
          "Pawn_White_8/Pawn",
          "Pawn_White_8/Queen",
          "Pawn_White_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 14,
          "end": 16
        },
        "startName": "0_MSBMiddleEightBit",
        "endName": "0_LSBMiddleEightBit",
        "bitIndex": 14
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_1_Promotion",
        "objectNames": [
          "Pawn_Black_1/Pawn",
          "Pawn_Black_1/Queen",
          "Pawn_Black_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 16,
          "end": 18
        },
        "startName": "0_LSBMiddleEightBit",
        "endName": "0_LSBEightBit",
        "bitIndex": 0
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_2_Promotion",
        "objectNames": [
          "Pawn_Black_2/Pawn",
          "Pawn_Black_2/Queen",
          "Pawn_Black_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 18,
          "end": 20
        },
        "startName": "0_LSBMiddleEightBit",
        "endName": "0_LSBEightBit",
        "bitIndex": 2
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_3_Promotion",
        "objectNames": [
          "Pawn_Black_3/Pawn",
          "Pawn_Black_3/Queen",
          "Pawn_Black_3/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 20,
          "end": 22
        },
        "startName": "0_LSBMiddleEightBit",
        "endName": "0_LSBEightBit",
        "bitIndex": 4
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_4_Promotion",
        "objectNames": [
          "Pawn_Black_4/Pawn",
          "Pawn_Black_4/Queen",
          "Pawn_Black_4/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 22,
          "end": 24
        },
        "startName": "0_LSBMiddleEightBit",
        "endName": "0_LSBEightBit",
        "bitIndex": 6
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_5_Promotion",
        "objectNames": [
          "Pawn_Black_5/Pawn",
          "Pawn_Black_5/Queen",
          "Pawn_Black_5/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 24,
          "end": 26
        },
        "startName": "0_LSBEightBit",
        "endName": "1_MSBEightBit",
        "bitIndex": 8
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_6_Promotion",
        "objectNames": [
          "Pawn_Black_6/Pawn",
          "Pawn_Black_6/Queen",
          "Pawn_Black_6/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 26,
          "end": 28
        },
        "startName": "0_LSBEightBit",
        "endName": "1_MSBEightBit",
        "bitIndex": 10
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_7_Promotion",
        "objectNames": [
          "Pawn_Black_7/Pawn",
          "Pawn_Black_7/Queen",
          "Pawn_Black_7/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 28,
          "end": 30
        },
        "startName": "0_LSBEightBit",
        "endName": "1_MSBEightBit",
        "bitIndex": 12
      },
      {
        "size": 2,
        "type": "i",
        "name": "Pawn_Black_8_Promotion",
        "objectNames": [
          "Pawn_Black_8/Pawn",
          "Pawn_Black_8/Queen",
          "Pawn_Black_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPromotion",
          "LastBitsPromotion"
        ],
        "range": {
          "start": 30,
          "end": 32
        },
        "startName": "0_LSBEightBit",
        "endName": "1_MSBEightBit",
        "bitIndex": 14
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_1_Position",
        "objectNames": [
          "Pawn_White_1/Pawn",
          "Pawn_White_1/Queen",
          "Pawn_White_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 32,
          "end": 38
        },
        "startName": "1_MSBEightBit",
        "endName": "1_MSBMiddleEightBit",
        "bitIndex": 0
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_2_Position",
        "objectNames": [
          "Pawn_White_2/Pawn",
          "Pawn_White_2/Queen",
          "Pawn_White_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 38,
          "end": 44
        },
        "startName": "1_MSBEightBit",
        "endName": "1_MSBMiddleEightBit",
        "bitIndex": 6
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_3_Position",
        "objectNames": [
          "Pawn_White_3/Pawn",
          "Pawn_White_3/Queen",
          "Pawn_White_3/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 44,
          "end": 50
        },
        "startName": "1_MSBMiddleEightBit",
        "endName": "1_LSBMiddleEightBit",
        "bitIndex": 12
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_4_Position",
        "objectNames": [
          "Pawn_White_4/Pawn",
          "Pawn_White_4/Queen",
          "Pawn_White_4/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 50,
          "end": 56
        },
        "startName": "1_LSBMiddleEightBit",
        "endName": "1_LSBEightBit",
        "bitIndex": 2
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_5_Position",
        "objectNames": [
          "Pawn_White_5/Pawn",
          "Pawn_White_5/Queen",
          "Pawn_White_5/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 56,
          "end": 62
        },
        "startName": "1_LSBEightBit",
        "endName": "2_MSBEightBit",
        "bitIndex": 8
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_6_Position",
        "objectNames": [
          "Pawn_White_6/Pawn",
          "Pawn_White_6/Queen",
          "Pawn_White_6/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 62,
          "end": 68
        },
        "startName": "1_LSBEightBit",
        "endName": "2_MSBEightBit",
        "bitIndex": 14
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_7_Position",
        "objectNames": [
          "Pawn_White_7/Pawn",
          "Pawn_White_7/Queen",
          "Pawn_White_7/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 68,
          "end": 74
        },
        "startName": "2_MSBEightBit",
        "endName": "2_MSBMiddleEightBit",
        "bitIndex": 4
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_White_8_Position",
        "objectNames": [
          "Pawn_White_8/Pawn",
          "Pawn_White_8/Queen",
          "Pawn_White_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 74,
          "end": 80
        },
        "startName": "2_MSBMiddleEightBit",
        "endName": "2_LSBMiddleEightBit",
        "bitIndex": 10
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_1_Position",
        "objectNames": [
          "Pawn_Black_1/Pawn",
          "Pawn_Black_1/Queen",
          "Pawn_Black_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 80,
          "end": 86
        },
        "startName": "2_LSBMiddleEightBit",
        "endName": "2_LSBEightBit",
        "bitIndex": 0
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_2_Position",
        "objectNames": [
          "Pawn_Black_2/Pawn",
          "Pawn_Black_2/Queen",
          "Pawn_Black_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 86,
          "end": 92
        },
        "startName": "2_LSBMiddleEightBit",
        "endName": "2_LSBEightBit",
        "bitIndex": 6
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_3_Position",
        "objectNames": [
          "Pawn_Black_3/Pawn",
          "Pawn_Black_3/Queen",
          "Pawn_Black_3/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 92,
          "end": 98
        },
        "startName": "2_LSBEightBit",
        "endName": "3_MSBEightBit",
        "bitIndex": 12
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_4_Position",
        "objectNames": [
          "Pawn_Black_4/Pawn",
          "Pawn_Black_4/Queen",
          "Pawn_Black_4/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 98,
          "end": 104
        },
        "startName": "3_MSBEightBit",
        "endName": "3_MSBMiddleEightBit",
        "bitIndex": 2
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_5_Position",
        "objectNames": [
          "Pawn_Black_5/Pawn",
          "Pawn_Black_5/Queen",
          "Pawn_Black_5/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 104,
          "end": 110
        },
        "startName": "3_MSBMiddleEightBit",
        "endName": "3_LSBMiddleEightBit",
        "bitIndex": 8
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_6_Position",
        "objectNames": [
          "Pawn_Black_6/Pawn",
          "Pawn_Black_6/Queen",
          "Pawn_Black_6/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 110,
          "end": 116
        },
        "startName": "3_MSBMiddleEightBit",
        "endName": "3_LSBMiddleEightBit",
        "bitIndex": 14
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_7_Position",
        "objectNames": [
          "Pawn_Black_7/Pawn",
          "Pawn_Black_7/Queen",
          "Pawn_Black_7/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 116,
          "end": 122
        },
        "startName": "3_LSBMiddleEightBit",
        "endName": "3_LSBEightBit",
        "bitIndex": 4
      },
      {
        "size": 6,
        "type": "i",
        "name": "Pawn_Black_8_Position",
        "objectNames": [
          "Pawn_Black_8/Pawn",
          "Pawn_Black_8/Queen",
          "Pawn_Black_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 122,
          "end": 128
        },
        "startName": "3_LSBEightBit",
        "endName": "4_MSBEightBit",
        "bitIndex": 10
      },
      {
        "size": 6,
        "type": "i",
        "name": "Rook_White_1_Position",
        "objectNames": [
          "Rook_White_1/Rook"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 128,
          "end": 134
        },
        "startName": "4_MSBEightBit",
        "endName": "4_MSBMiddleEightBit",
        "bitIndex": 0
      },
      {
        "size": 6,
        "type": "i",
        "name": "Rook_White_2_Position",
        "objectNames": [
          "Rook_White_2/Rook"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 134,
          "end": 140
        },
        "startName": "4_MSBEightBit",
        "endName": "4_MSBMiddleEightBit",
        "bitIndex": 6
      },
      {
        "size": 6,
        "type": "i",
        "name": "Rook_Black_1_Position",
        "objectNames": [
          "Rook_Black_1/Rook"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 140,
          "end": 146
        },
        "startName": "4_MSBMiddleEightBit",
        "endName": "4_LSBMiddleEightBit",
        "bitIndex": 12
      },
      {
        "size": 6,
        "type": "i",
        "name": "Rook_Black_2_Position",
        "objectNames": [
          "Rook_Black_2/Rook"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 146,
          "end": 152
        },
        "startName": "4_LSBMiddleEightBit",
        "endName": "4_LSBEightBit",
        "bitIndex": 2
      },
      {
        "size": 5,
        "type": "i",
        "name": "Bishop_White_1_Position",
        "objectNames": [
          "Bishop_White_1/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 152,
          "end": 157
        },
        "startName": "4_LSBEightBit",
        "endName": "5_MSBEightBit",
        "bitIndex": 8
      },
      {
        "size": 5,
        "type": "i",
        "name": "Bishop_White_2_Position",
        "objectNames": [
          "Bishop_White_2/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 157,
          "end": 162
        },
        "startName": "4_LSBEightBit",
        "endName": "5_MSBEightBit",
        "bitIndex": 13
      },
      {
        "size": 5,
        "type": "i",
        "name": "Bishop_Black_1_Position",
        "objectNames": [
          "Bishop_Black_1/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 162,
          "end": 167
        },
        "startName": "5_MSBEightBit",
        "endName": "5_MSBMiddleEightBit",
        "bitIndex": 2
      },
      {
        "size": 5,
        "type": "i",
        "name": "Bishop_Black_2_Position",
        "objectNames": [
          "Bishop_Black_2/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 167,
          "end": 172
        },
        "startName": "5_MSBEightBit",
        "endName": "5_MSBMiddleEightBit",
        "bitIndex": 7
      },
      {
        "size": 6,
        "type": "i",
        "name": "Knight_White_1_Position",
        "objectNames": [
          "Knight_White_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 172,
          "end": 178
        },
        "startName": "5_MSBMiddleEightBit",
        "endName": "5_LSBMiddleEightBit",
        "bitIndex": 12
      },
      {
        "size": 6,
        "type": "i",
        "name": "Knight_White_2_Position",
        "objectNames": [
          "Knight_White_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 178,
          "end": 184
        },
        "startName": "5_LSBMiddleEightBit",
        "endName": "5_LSBEightBit",
        "bitIndex": 2
      },
      {
        "size": 6,
        "type": "i",
        "name": "Knight_Black_1_Position",
        "objectNames": [
          "Knight_Black_1/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 184,
          "end": 190
        },
        "startName": "5_LSBEightBit",
        "endName": "6_MSBEightBit",
        "bitIndex": 8
      },
      {
        "size": 6,
        "type": "i",
        "name": "Knight_Black_2_Position",
        "objectNames": [
          "Knight_Black_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 190,
          "end": 196
        },
        "startName": "5_LSBEightBit",
        "endName": "6_MSBEightBit",
        "bitIndex": 14
      },
      {
        "size": 6,
        "type": "i",
        "name": "Queen_White_1_Position",
        "objectNames": [
          "Queen_White_1/Queen"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 196,
          "end": 202
        },
        "startName": "6_MSBEightBit",
        "endName": "6_MSBMiddleEightBit",
        "bitIndex": 4
      },
      {
        "size": 6,
        "type": "i",
        "name": "King_White_1_Position",
        "objectNames": [
          "King_White_1/King"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 202,
          "end": 208
        },
        "startName": "6_MSBMiddleEightBit",
        "endName": "6_LSBMiddleEightBit",
        "bitIndex": 10
      },
      {
        "size": 6,
        "type": "i",
        "name": "Queen_Black_1_Position",
        "objectNames": [
          "Queen_Black_1/Queen"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 208,
          "end": 214
        },
        "startName": "6_LSBMiddleEightBit",
        "endName": "6_LSBEightBit",
        "bitIndex": 0
      },
      {
        "size": 6,
        "type": "i",
        "name": "King_Black_1_Position",
        "objectNames": [
          "King_Black_1/King"
        ],
        "shaderParameters": [
          "FirstBitsPosition",
          "LastBitsPosition"
        ],
        "range": {
          "start": 214,
          "end": 220
        },
        "startName": "6_LSBMiddleEightBit",
        "endName": "6_LSBEightBit",
        "bitIndex": 6
      },
      {
        "size": 1,
        "type": "i",
        "name": "Rook_White_Both_Captured",
        "objectNames": [
          "Rook_White_1/Rook",
          "Rook_White_2/Rook"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 220,
          "end": 221
        },
        "startName": "6_LSBEightBit",
        "endName": "7_MSBEightBit",
        "bitIndex": 12
      },
      {
        "size": 1,
        "type": "i",
        "name": "Rook_Black_Both_Captured",
        "objectNames": [
          "Rook_Black_1/Rook",
          "Rook_Black_2/Rook"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 221,
          "end": 222
        },
        "startName": "6_LSBEightBit",
        "endName": "7_MSBEightBit",
        "bitIndex": 13
      },
      {
        "size": 1,
        "type": "i",
        "name": "Bishop_White_Both_Captured",
        "objectNames": [
          "Bishop_White_1/Bishop",
          "Bishop_White_2/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 222,
          "end": 223
        },
        "startName": "6_LSBEightBit",
        "endName": "7_MSBEightBit",
        "bitIndex": 14
      },
      {
        "size": 1,
        "type": "i",
        "name": "Bishop_Black_Both_Captured",
        "objectNames": [
          "Bishop_Black_1/Bishop",
          "Bishop_Black_2/Bishop"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 223,
          "end": 224
        },
        "startName": "6_LSBEightBit",
        "endName": "7_MSBEightBit",
        "bitIndex": 15
      },
      {
        "size": 1,
        "type": "i",
        "name": "Knight_White_Both_Captured",
        "objectNames": [
          "Knight_White_1/Knight",
          "Knight_White_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 224,
          "end": 225
        },
        "startName": "7_MSBEightBit",
        "endName": "7_MSBMiddleEightBit",
        "bitIndex": 0
      },
      {
        "size": 1,
        "type": "i",
        "name": "Knight_Black_Both_Captured",
        "objectNames": [
          "Knight_Black_1/Knight",
          "Knight_Black_2/Knight"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 225,
          "end": 226
        },
        "startName": "7_MSBEightBit",
        "endName": "7_MSBMiddleEightBit",
        "bitIndex": 1
      },
      {
        "size": 1,
        "type": "i",
        "name": "Queen_White_1_Captured",
        "objectNames": [
          "Queen_White_1/Queen"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 226,
          "end": 227
        },
        "startName": "7_MSBEightBit",
        "endName": "7_MSBMiddleEightBit",
        "bitIndex": 2
      },
      {
        "size": 1,
        "type": "i",
        "name": "Queen_Black_1_Captured",
        "objectNames": [
          "Queen_Black_1/Queen"
        ],
        "shaderParameters": [
          "FirstBitsBothCaptured",
          "LastBitsBothCaptured"
        ],
        "range": {
          "start": 227,
          "end": 228
        },
        "startName": "7_MSBEightBit",
        "endName": "7_MSBMiddleEightBit",
        "bitIndex": 3
      },
      {
        "size": 5,
        "type": "i",
        "name": "Selected_Piece",
        "objectNames": [
          "Rook_White_1/Rook",
          "Rook_White_2/Rook",
          "Rook_Black_1/Rook",
          "Rook_Black_2/Rook",
          "Bishop_White_1/Bishop",
          "Bishop_White_2/Bishop",
          "Bishop_Black_1/Bishop",
          "Bishop_Black_2/Bishop",
          "Knight_White_1/Knight",
          "Knight_White_2/Knight",
          "Knight_Black_1/Knight",
          "Knight_Black_2/Knight",
          "King_White_1/King",
          "King_Black_1/King",
          "Queen_White_1/Queen",
          "Queen_Black_1/Queen",
          "Pawn_White_1/Pawn",
          "Pawn_White_1/Queen",
          "Pawn_White_1/Knight",
          "Pawn_White_2/Pawn",
          "Pawn_White_2/Queen",
          "Pawn_White_2/Knight",
          "Pawn_White_3/Pawn",
          "Pawn_White_3/Queen",
          "Pawn_White_3/Knight",
          "Pawn_White_4/Pawn",
          "Pawn_White_4/Queen",
          "Pawn_White_4/Knight",
          "Pawn_White_5/Pawn",
          "Pawn_White_5/Queen",
          "Pawn_White_5/Knight",
          "Pawn_White_6/Pawn",
          "Pawn_White_6/Queen",
          "Pawn_White_6/Knight",
          "Pawn_White_7/Pawn",
          "Pawn_White_7/Queen",
          "Pawn_White_7/Knight",
          "Pawn_White_8/Pawn",
          "Pawn_White_8/Queen",
          "Pawn_White_8/Knight",
          "Pawn_Black_1/Pawn",
          "Pawn_Black_1/Queen",
          "Pawn_Black_1/Knight",
          "Pawn_Black_2/Pawn",
          "Pawn_Black_2/Queen",
          "Pawn_Black_2/Knight",
          "Pawn_Black_3/Pawn",
          "Pawn_Black_3/Queen",
          "Pawn_Black_3/Knight",
          "Pawn_Black_4/Pawn",
          "Pawn_Black_4/Queen",
          "Pawn_Black_4/Knight",
          "Pawn_Black_5/Pawn",
          "Pawn_Black_5/Queen",
          "Pawn_Black_5/Knight",
          "Pawn_Black_6/Pawn",
          "Pawn_Black_6/Queen",
          "Pawn_Black_6/Knight",
          "Pawn_Black_7/Pawn",
          "Pawn_Black_7/Queen",
          "Pawn_Black_7/Knight",
          "Pawn_Black_8/Pawn",
          "Pawn_Black_8/Queen",
          "Pawn_Black_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsSelectedPiece",
          "LastBitsSelectedPiece"
        ],
        "range": {
          "start": 228,
          "end": 233
        },
        "startName": "7_MSBEightBit",
        "endName": "7_MSBMiddleEightBit",
        "bitIndex": 4
      },
      {
        "size": 6,
        "type": "i",
        "name": "Selected_Position",
        "objectNames": [
          "Selected_Position"
        ],
        "shaderParameters": [
          "FirstBitsSelectedPosition",
          "LastBitsSelectedPosition"
        ],
        "range": {
          "start": 233,
          "end": 239
        },
        "startName": "7_MSBMiddleEightBit",
        "endName": "7_LSBMiddleEightBit",
        "bitIndex": 9
      },
      {
        "size": 1,
        "type": "i",
        "name": "Selected_Piece_Shown",
        "objectNames": [
          "Rook_White_1/Rook",
          "Rook_White_2/Rook",
          "Rook_Black_1/Rook",
          "Rook_Black_2/Rook",
          "Bishop_White_1/Bishop",
          "Bishop_White_2/Bishop",
          "Bishop_Black_1/Bishop",
          "Bishop_Black_2/Bishop",
          "Knight_White_1/Knight",
          "Knight_White_2/Knight",
          "Knight_Black_1/Knight",
          "Knight_Black_2/Knight",
          "King_White_1/King",
          "King_Black_1/King",
          "Queen_White_1/Queen",
          "Queen_Black_1/Queen",
          "Pawn_White_1/Pawn",
          "Pawn_White_1/Queen",
          "Pawn_White_1/Knight",
          "Pawn_White_2/Pawn",
          "Pawn_White_2/Queen",
          "Pawn_White_2/Knight",
          "Pawn_White_3/Pawn",
          "Pawn_White_3/Queen",
          "Pawn_White_3/Knight",
          "Pawn_White_4/Pawn",
          "Pawn_White_4/Queen",
          "Pawn_White_4/Knight",
          "Pawn_White_5/Pawn",
          "Pawn_White_5/Queen",
          "Pawn_White_5/Knight",
          "Pawn_White_6/Pawn",
          "Pawn_White_6/Queen",
          "Pawn_White_6/Knight",
          "Pawn_White_7/Pawn",
          "Pawn_White_7/Queen",
          "Pawn_White_7/Knight",
          "Pawn_White_8/Pawn",
          "Pawn_White_8/Queen",
          "Pawn_White_8/Knight",
          "Pawn_Black_1/Pawn",
          "Pawn_Black_1/Queen",
          "Pawn_Black_1/Knight",
          "Pawn_Black_2/Pawn",
          "Pawn_Black_2/Queen",
          "Pawn_Black_2/Knight",
          "Pawn_Black_3/Pawn",
          "Pawn_Black_3/Queen",
          "Pawn_Black_3/Knight",
          "Pawn_Black_4/Pawn",
          "Pawn_Black_4/Queen",
          "Pawn_Black_4/Knight",
          "Pawn_Black_5/Pawn",
          "Pawn_Black_5/Queen",
          "Pawn_Black_5/Knight",
          "Pawn_Black_6/Pawn",
          "Pawn_Black_6/Queen",
          "Pawn_Black_6/Knight",
          "Pawn_Black_7/Pawn",
          "Pawn_Black_7/Queen",
          "Pawn_Black_7/Knight",
          "Pawn_Black_8/Pawn",
          "Pawn_Black_8/Queen",
          "Pawn_Black_8/Knight"
        ],
        "shaderParameters": [
          "FirstBitsSelectedPieceShown",
          "LastBitsSelectedPieceShown"
        ],
        "range": {
          "start": 239,
          "end": 240
        },
        "startName": "7_MSBMiddleEightBit",
        "endName": "7_LSBMiddleEightBit",
        "bitIndex": 15
      },
      {
        "size": 1,
        "type": "i",
        "name": "Selected_Position_Shown",
        "objectNames": [
          "Selected_Position"
        ],
        "shaderParameters": [
          "FirstBitsSelectedPositionShown",
          "LastBitsSelectedPositionShown"
        ],
        "range": {
          "start": 240,
          "end": 241
        },
        "startName": "Overflow_bit_1",
        "endName": "Overflow_bit_1",
        "bitIndex": 0
      }
    ].map((a, index) => {
      return {
        ...a,
        id: Date.now() +'_'+ Math.random() + Math.random() * Math.random(),
        color: this.b(a.size),
        width: a.size / 256 * 100 * 2 + '%'
      }
    });
    this.bitsUsed = this.bitArray.reduce((acc, v) => acc + v.size, 0);
    this.bitArray.push({
      "size": 256 - this.bitsUsed,
      "type": "",
      "name": "Unused bits",
      "objectNames": [],
      "shaderParameters": [],
      "range": {
        "start": 0,
        "end": 0
      },
      "startName": "",
      "endName": "",
      "bitIndex": 0,
      id: Date.now() + '_' + Math.random() + Math.random() * Math.random(),
      color: 'rgb(255, 255, 255)',
      width: (256 - this.bitsUsed) / 256 * 100 * 2 + '%'
    });
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
}
