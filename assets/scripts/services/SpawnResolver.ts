import { BoardModel } from "../models/BoardModel";
import { SpecialTileType, TileColor } from "../models/types";

export class SpawnResolver {
  fill(board: BoardModel, colors: TileColor[], random: () => number): void {
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const position = { x: x, y: y };
        if (!board.get(position)) {
          const index = Math.floor(random() * colors.length);
          const color = colors[index];
          board.set(position, board.createTile(color, SpecialTileType.None));
        }
      }
    }
  }
}
