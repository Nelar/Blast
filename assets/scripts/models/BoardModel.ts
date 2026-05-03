import { GridPosition, SpecialTileType, TileColor, TileData } from "./types";

export class BoardModel {
  private readonly widthValue: number;
  private readonly heightValue: number;
  private readonly cells: Array<Array<TileData | null>>;
  private nextId = 1;

  constructor(width: number, height: number) {
    this.widthValue = width;
    this.heightValue = height;
    this.cells = [];
    for (let y = 0; y < height; y++) {
      const row: Array<TileData | null> = [];
      for (let x = 0; x < width; x++) {
        row.push(null);
      }
      this.cells.push(row);
    }
  }

  get width(): number {
    return this.widthValue;
  }

  get height(): number {
    return this.heightValue;
  }

  inBounds(position: GridPosition): boolean {
    return position.x >= 0 && position.x < this.widthValue && position.y >= 0 && position.y < this.heightValue;
  }

  get(position: GridPosition): TileData | null {
    if (!this.inBounds(position)) {
      return null;
    }
    return this.cells[position.y][position.x];
  }

  set(position: GridPosition, tile: TileData | null): void {
    if (!this.inBounds(position)) {
      return;
    }
    this.cells[position.y][position.x] = tile;
  }

  swap(a: GridPosition, b: GridPosition): void {
    if (!this.inBounds(a) || !this.inBounds(b)) {
      return;
    }
    const first = this.cells[a.y][a.x];
    this.cells[a.y][a.x] = this.cells[b.y][b.x];
    this.cells[b.y][b.x] = first;
  }

  createTile(color: TileColor, special: SpecialTileType): TileData {
    const tile: TileData = {
      id: this.nextId,
      color: color,
      special: special,
    };
    this.nextId++;
    return tile;
  }

  forEachCell(handler: (position: GridPosition, tile: TileData | null) => void): void {
    for (let y = 0; y < this.heightValue; y++) {
      for (let x = 0; x < this.widthValue; x++) {
        handler({ x: x, y: y }, this.cells[y][x]);
      }
    }
  }
}
