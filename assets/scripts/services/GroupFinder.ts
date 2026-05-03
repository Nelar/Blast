import { BoardModel } from "../models/BoardModel";
import { GridPosition } from "../models/types";

export class GroupFinder {
  private readonly directions: GridPosition[] = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];

  findGroup(board: BoardModel, start: GridPosition, minSize: number): GridPosition[] {
    const startTile = board.get(start);
    if (!startTile) {
      return [];
    }
    const queue: GridPosition[] = [start];
    let visited: Record<string, boolean> = {};
    const result: GridPosition[] = [];

    while (queue.length > 0) {
      const current = queue.shift() as GridPosition;
      const key = current.x + ":" + current.y;
      if (visited[key]) {
        continue;
      }
      visited[key] = true;
      const tile = board.get(current);
      if (!tile || tile.color !== startTile.color) {
        continue;
      }
      result.push(current);
      for (let i = 0; i < this.directions.length; i++) {
        const next = {
          x: current.x + this.directions[i].x,
          y: current.y + this.directions[i].y,
        };
        if (board.inBounds(next)) {
          queue.push(next);
        }
      }
    }

    if (result.length < minSize) {
      return [];
    }
    return result;
  }

  hasAnyGroup(board: BoardModel, minSize: number): boolean {
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const group = this.findGroup(board, { x: x, y: y }, minSize);
        if (group.length > 0) {
          return true;
        }
      }
    }
    return false;
  }
}
