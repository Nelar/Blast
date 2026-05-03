import { BoardModel } from "../models/BoardModel";

export class GravityResolver {
  apply(board: BoardModel): void {
    for (let x = 0; x < board.width; x++) {
      let writeY = 0;
      for (let y = 0; y < board.height; y++) {
        const tile = board.get({ x: x, y: y });
        if (tile) {
          if (writeY !== y) {
            board.set({ x: x, y: writeY }, tile);
            board.set({ x: x, y: y }, null);
          }
          writeY++;
        }
      }
      for (let clearY = writeY; clearY < board.height; clearY++) {
        board.set({ x: x, y: clearY }, null);
      }
    }
  }
}
