import { FileService } from "../../magic box/file-service";
import { GameLogicResponse } from "../../models/game_logic_response";
import { OSCVrChatGameLogic } from "../../models/osc_vrchat_game_logic";
import { inflateSync } from "zlib";

export class Tamagotchi implements OSCVrChatGameLogic {
    public getState(): { [key in string]: number; } {
        return {
            Community_Card_1: 0,
            Community_Card_2: 0,
            Community_Card_3: 0,
            Community_Card_4: 0,
            Community_Card_5: 0,
            Community_Pool: 0,
            Bet_Value: 0,
            Player_1_Turn: 0,
            Player_2_Turn: 0,
            Player_3_Turn: 0,
            Player_4_Turn: 0,
            Player_5_Turn: 0,
            Player_6_Turn: 0,
            Player_7_Turn: 0,
            Player_8_Turn: 0,
            Blind: 0,
            Player_1_Card_1: 0,
            Player_1_Card_2: 0,
            Player_2_Card_1: 0,
            Player_2_Card_2: 0,
            Player_3_Card_1: 0,
            Player_3_Card_2: 0,
            Player_4_Card_1: 0,
            Player_4_Card_2: 0,
            Player_5_Card_1: 0,
            Player_5_Card_2: 0,
            Player_6_Card_1: 0,
            Player_6_Card_2: 0,
            Player_7_Card_1: 0,
            Player_7_Card_2: 0,
            Player_8_Card_1: 0,
            Player_8_Card_2: 0,
            Player_1_Pool: 0,
            Player_2_Pool: 0,
            Player_3_Pool: 0,
            Player_4_Pool: 0,
            Player_5_Pool: 0,
            Player_6_Pool: 0,
            Player_7_Pool: 0,
            Player_8_Pool: 0
        }
    }
    public handleInput(input: string): GameLogicResponse {
        return {
            message: input,
            updateVrc: false
        }
    }
    public debugInfo(): string {
        return '';
    }



    constructor() {
        this.resolution = new Array(this.resolutionY).fill(new Array(this.resolutionX).fill(false));
        this.drawState = DrawStates.Default;

        if (this.resolution) {

        }

        if (this.drawState) {

        }

        this.DefaultDraw();
        this.getData();
        this.DefaultMirrored();
        this.DefaultText();
        this.DefaultCentered();
        this.DefaultIndexed();
        this.DefaultDiagonal();
        this.DefaultReverseDiagonal();
        this.DefaultPreset();
    }

    private getData(): Array<boolean>
    {
        const base64 = FileService.getFile('./../OSC Vrchat server/src/game logic/tamagotchi/Assets/test.png', 'base64');
        const binary = this.base64ToUint8Array(base64);
        const bits = new Uint8Array(binary);
        const datac = this.decodePNG(bits);
        const idatChunks = Array.isArray(datac['IDAT']) ? datac['IDAT'] : [datac['IDAT']];
        const concatenatedIDAT = Buffer.concat(idatChunks.map(chunk => Buffer.from(chunk)));
        const decompressedData = this.decompressIDAT(Buffer.from(concatenatedIDAT));

        return this.getPixelData(decompressedData, datac['IHDR'].width, datac['IHDR'].height).map(rgb => rgb.b === 255 ? false : true);
    }

    private DefaultDraw(): Array<boolean> {
        return this.getData();
    }

    private DefaultMirrored(): void {
        this.getData()

    }

    private DefaultText(): void {
        

    }

    private DefaultCentered(): void {
        

    }

    private DefaultIndexed(): void {
        

    }

    private DefaultDiagonal(): void {
        

    }

    private DefaultReverseDiagonal(): void {
        

    }

    private DefaultPreset(): void {
        

    }

    private base64ToUint8Array(base64: string): Uint8Array {
        // Decode Base64 to binary string
        const binaryString = atob(base64);

        // Convert binary string to Uint8Array
        const length = binaryString.length;
        const array = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            array[i] = binaryString.charCodeAt(i);
        }

        return array;
    }

    private decodePNG(data: Uint8Array) {
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]; // PNG magic number
        const signature = data.slice(0, 8);

        // Validate PNG signature
        if (!pngSignature.every((byte, i) => byte === signature[i])) {
            throw new Error("Invalid PNG file.");
        }

        let offset: number = 8; // Skip signature
        const chunks: Record<string, any> = {};

        while (offset < data.length) {
            const length = (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!;
            const type = String.fromCharCode(
                data[offset + 4]!,
                data[offset + 5]!,
                data[offset + 6]!,
                data[offset + 7]!
            );
            const chunkData = data.slice(offset + 8, offset + 8 + length);
            const crc = data.slice(offset + 8 + length, offset + 12 + length);

            if (crc) { }
            // Process specific chunks
            if (type === "IHDR") {
                chunks['IHDR'] = {
                    width: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                    height: (chunkData[4]! << 24) | (chunkData[5]! << 16) | (chunkData[6]! << 8) | chunkData[7]!,
                    bitDepth: chunkData[8],
                    colorType: chunkData[9],
                    compressionMethod: chunkData[10],
                    filterMethod: chunkData[11],
                    interlaceMethod: chunkData[12],
                };
            } else if (type === "gAMA") {
                chunks['gAMA'] = {
                    gamma: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                };
            } else if (type === "pHYs") {
                chunks['pHYs'] = {
                    pixelsPerUnitX: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                    pixelsPerUnitY: (chunkData[4]! << 24) | (chunkData[5]! << 16) | (chunkData[6]! << 8) | chunkData[7]!,
                    unitSpecifier: chunkData[8],
                };
            } else if (type === "IDAT") {
                chunks['IDAT'] = chunkData; // Typically needs decompression
            } else if (type === "IEND") {
                chunks['IEND'] = "end";
            }

            offset += 12 + length; // Move to the next chunk
        }

        return chunks;
    }

    private decompressIDAT(idatData: any): Buffer {
        // Remove zlib header (first 2 bytes) and Adler-32 checksum (last 4 bytes)
        //const deflateData = idatData.slice(0, idatData.length - 4);

        // Decompress the deflate data
        const decompressedData = inflateSync(idatData);
        return decompressedData;
    }

    private getPixelData(decompressedData: any, width: number, height: number) {
        const bytesPerPixel = 3; // R, G, B
        const scanlineSize = 1 + width * bytesPerPixel; // 1 filter byte + pixel data
        const pixels = [];

        for (let y = 0; y < height; y++) {
            const scanlineStart = y * scanlineSize;

            // Skip the filter byte
            const scanline = decompressedData.slice(scanlineStart + 1, scanlineStart + scanlineSize);

            for (let x = 0; x < width; x++) {
                const pixelStart = x * bytesPerPixel;
                const r = scanline[pixelStart];
                const g = scanline[pixelStart + 1];
                const b = scanline[pixelStart + 2];

                // Store pixel data as an object (or whatever format you need)
                pixels.push({ r, g, b });
            }
        }

        return pixels;
    }


    private readonly resolution: Array<Array<boolean>>;
    private readonly resolutionX: number = 32;
    private readonly resolutionY: number = 16;
    private drawState: DrawStates;
}

class PNGReader {
    private base64ToUint8Array(base64: string): Uint8Array {
        // Decode Base64 to binary string
        const binaryString = atob(base64);

        // Convert binary string to Uint8Array
        const length = binaryString.length;
        const array = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            array[i] = binaryString.charCodeAt(i);
        }

        return array;
    }

    private decodePNG(data: Uint8Array) {
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10]; // PNG magic number
        const signature = data.slice(0, 8);

        // Validate PNG signature
        if (!pngSignature.every((byte, i) => byte === signature[i])) {
            throw new Error("Invalid PNG file.");
        }

        let offset: number = 8; // Skip signature
        const chunks: Record<string, any> = {};

        while (offset < data.length) {
            const length = (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!;
            const type = String.fromCharCode(
                data[offset + 4]!,
                data[offset + 5]!,
                data[offset + 6]!,
                data[offset + 7]!
            );
            const chunkData = data.slice(offset + 8, offset + 8 + length);
            const crc = data.slice(offset + 8 + length, offset + 12 + length);

            if (crc) { }
            // Process specific chunks
            if (type === "IHDR") {
                chunks['IHDR'] = {
                    width: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                    height: (chunkData[4]! << 24) | (chunkData[5]! << 16) | (chunkData[6]! << 8) | chunkData[7]!,
                    bitDepth: chunkData[8],
                    colorType: chunkData[9],
                    compressionMethod: chunkData[10],
                    filterMethod: chunkData[11],
                    interlaceMethod: chunkData[12],
                };
            } else if (type === "gAMA") {
                chunks['gAMA'] = {
                    gamma: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                };
            } else if (type === "pHYs") {
                chunks['pHYs'] = {
                    pixelsPerUnitX: (chunkData[0]! << 24) | (chunkData[1]! << 16) | (chunkData[2]! << 8) | chunkData[3]!,
                    pixelsPerUnitY: (chunkData[4]! << 24) | (chunkData[5]! << 16) | (chunkData[6]! << 8) | chunkData[7]!,
                    unitSpecifier: chunkData[8],
                };
            } else if (type === "IDAT") {
                chunks['IDAT'] = chunkData; // Typically needs decompression
            } else if (type === "IEND") {
                chunks['IEND'] = "end";
            }

            offset += 12 + length; // Move to the next chunk
        }

        return chunks;
    }

    private decompressIDAT(idatData: any): Buffer {
        // Remove zlib header (first 2 bytes) and Adler-32 checksum (last 4 bytes)
        //const deflateData = idatData.slice(0, idatData.length - 4);

        // Decompress the deflate data
        const decompressedData = inflateSync(idatData);
        return decompressedData;
    }

    private getPixelData(decompressedData: any, width: number, height: number) {
        const bytesPerPixel = 3; // R, G, B
        const scanlineSize = 1 + width * bytesPerPixel; // 1 filter byte + pixel data
        const pixels = [];

        for (let y = 0; y < height; y++) {
            const scanlineStart = y * scanlineSize;

            // Skip the filter byte
            const scanline = decompressedData.slice(scanlineStart + 1, scanlineStart + scanlineSize);

            for (let x = 0; x < width; x++) {
                const pixelStart = x * bytesPerPixel;
                const r = scanline[pixelStart];
                const g = scanline[pixelStart + 1];
                const b = scanline[pixelStart + 2];

                // Store pixel data as an object (or whatever format you need)
                pixels.push({ r, g, b });
            }
        }

        return pixels;
    }
}

enum DrawStates {
    Default = 0,
    Mirrored = 1,
    Text = 2,
    Centered = 3,
    Indexed = 4,
    Diagonal = 5,
    ReverseDiagonal = 6,
    Preset = 7
}