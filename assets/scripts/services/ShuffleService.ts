import { BoardModel } from "../models/BoardModel";
import { GridPosition, TileData } from "../models/types";

export class ShuffleService {
  shuffle(board: BoardModel, random: () => number): void {
    const positions: GridPosition[] = [];
    const tiles: TileData[] = [];
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const pos = { x: x, y: y };
        const tile = board.get(pos);
        if (tile) {
          positions.push(pos);
          tiles.push(tile);
        }
      }
    }
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const current = tiles[i];
      tiles[i] = tiles[j];
      tiles[j] = current;
    }
    for (let k = 0; k < positions.length; k++) {
      board.set(positions[k], tiles[k]);
    }
  }
}
