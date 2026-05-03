import { BoardModel } from "../models/BoardModel";
import { GridPosition, LevelConfig, MoveResult, SpecialTileType } from "../models/types";
import { GravityResolver } from "./GravityResolver";
import { GroupFinder } from "./GroupFinder";
import { ShuffleService } from "./ShuffleService";
import { SpawnResolver } from "./SpawnResolver";
import { SpecialTileFactory } from "./SpecialTileFactory";

export interface ShuffleOutcome {
  shuffled: boolean;
  usedShuffles: number;
}

export class RulesEngine {
  constructor(
    private readonly groupFinder: GroupFinder,
    private readonly gravityResolver: GravityResolver,
    private readonly spawnResolver: SpawnResolver,
    private readonly shuffleService: ShuffleService,
    private readonly specialTileFactory: SpecialTileFactory
  ) {}

  createInitial(board: BoardModel, config: LevelConfig, random: () => number): void {
    this.spawnResolver.fill(board, config.colors, random);
  }

  processTap(board: BoardModel, position: GridPosition, config: LevelConfig): MoveResult {
    const clickedTile = board.get(position);
    if (!clickedTile) {
      return this.invalid();
    }

    if (clickedTile.special !== SpecialTileType.None) {
      return this.resolveSpecialTap(board, position, config);
    }

    const group = this.groupFinder.findGroup(board, position, config.minGroupSize);
    if (group.length === 0) {
      return this.invalid();
    }

    const special = this.specialTileFactory.decideSpecial(group, position, config.superTileLineRequirement);
    let removedKeys: Record<string, GridPosition> = {};
    for (let i = 0; i < group.length; i++) {
      const key = this.key(group[i]);
      removedKeys[key] = group[i];
    }

    if (special !== SpecialTileType.None) {
      delete removedKeys[this.key(position)];
    }

    const finalRemoved = this.expandWithSpecials(board, this.toArray(removedKeys), config.tileBombRadius);
    let hasSpecial = false;
    for (let j = 0; j < finalRemoved.length; j++) {
      const removedTile = board.get(finalRemoved[j]);
      if (removedTile && removedTile.special !== SpecialTileType.None) {
        hasSpecial = true;
      }
      board.set(finalRemoved[j], null);
    }

    if (special !== SpecialTileType.None) {
      board.set(position, board.createTile(clickedTile.color, special));
    }

    this.gravityResolver.apply(board);
    this.spawnResolver.fill(board, config.colors, Math.random);

    let score = finalRemoved.length * config.scorePerTile;
    if (hasSpecial) {
      score = score * config.scoreSpecialMultiplier;
    }

    return {
      isValid: true,
      consumedMove: true,
      removed: finalRemoved,
      scoreDelta: score,
      spawnedSpecial: special === SpecialTileType.None ? null : { position: position, special: special },
    };
  }

  applyBombBooster(board: BoardModel, position: GridPosition, config: LevelConfig): MoveResult {
    const targets = this.positionsInRadius(board, position, config.boosterBombRadius);
    const removed = this.expandWithSpecials(board, targets, config.tileBombRadius);
    if (removed.length === 0) {
      return this.invalid();
    }
    for (let i = 0; i < removed.length; i++) {
      board.set(removed[i], null);
    }
    this.gravityResolver.apply(board);
    this.spawnResolver.fill(board, config.colors, Math.random);
    const score = removed.length * config.scorePerTile * config.scoreSpecialMultiplier;
    return {
      isValid: true,
      consumedMove: false,
      removed: removed,
      scoreDelta: score,
      spawnedSpecial: null,
    };
  }

  applyTeleport(board: BoardModel, first: GridPosition, second: GridPosition): boolean {
    if (!board.inBounds(first) || !board.inBounds(second)) {
      return false;
    }
    const firstTile = board.get(first);
    const secondTile = board.get(second);
    if (!firstTile || !secondTile) {
      return false;
    }
    board.swap(first, second);
    return true;
  }

  ensureHasMoves(board: BoardModel, config: LevelConfig, maxShufflesLeft: number, random: () => number): ShuffleOutcome {
    let used = 0;
    while (!this.groupFinder.hasAnyGroup(board, config.minGroupSize) && used < maxShufflesLeft) {
      this.shuffleService.shuffle(board, random);
      used++;
    }
    return {
      shuffled: used > 0,
      usedShuffles: used,
    };
  }

  hasAnyMoves(board: BoardModel, config: LevelConfig): boolean {
    return this.groupFinder.hasAnyGroup(board, config.minGroupSize);
  }

  private invalid(): MoveResult {
    return {
      isValid: false,
      consumedMove: false,
      removed: [],
      scoreDelta: 0,
      spawnedSpecial: null,
    };
  }

  private resolveSpecialTap(board: BoardModel, position: GridPosition, config: LevelConfig): MoveResult {
    const tile = board.get(position);
    if (!tile) {
      return this.invalid();
    }
    const targets = this.expandWithSpecials(board, [position], config.tileBombRadius);
    for (let i = 0; i < targets.length; i++) {
      board.set(targets[i], null);
    }
    this.gravityResolver.apply(board);
    this.spawnResolver.fill(board, config.colors, Math.random);
    return {
      isValid: true,
      consumedMove: true,
      removed: targets,
      scoreDelta: targets.length * config.scorePerTile * config.scoreSpecialMultiplier,
      spawnedSpecial: null,
    };
  }

  private expandWithSpecials(board: BoardModel, seed: GridPosition[], bombRadius: number): GridPosition[] {
    const queue = seed.slice();
    let removed: Record<string, GridPosition> = {};
    while (queue.length > 0) {
      const current = queue.shift() as GridPosition;
      if (!board.inBounds(current)) {
        continue;
      }
      const currentKey = this.key(current);
      if (removed[currentKey]) {
        continue;
      }
      const tile = board.get(current);
      if (!tile) {
        continue;
      }
      removed[currentKey] = current;
      const extra = this.specialTargets(board, current, tile.special, bombRadius);
      for (let i = 0; i < extra.length; i++) {
        const extraKey = this.key(extra[i]);
        if (!removed[extraKey]) {
          queue.push(extra[i]);
        }
      }
    }
    return this.toArray(removed);
  }

  private specialTargets(board: BoardModel, position: GridPosition, special: SpecialTileType, bombRadius: number): GridPosition[] {
    if (special === SpecialTileType.None) {
      return [];
    }
    if (special === SpecialTileType.RocketHorizontal) {
      const row: GridPosition[] = [];
      for (let x = 0; x < board.width; x++) {
        row.push({ x: x, y: position.y });
      }
      return row;
    }
    if (special === SpecialTileType.RocketVertical) {
      const column: GridPosition[] = [];
      for (let y = 0; y < board.height; y++) {
        column.push({ x: position.x, y: y });
      }
      return column;
    }
    if (special === SpecialTileType.Bomb) {
      return this.positionsInRadius(board, position, bombRadius);
    }
    return [];
  }

  private positionsInRadius(board: BoardModel, center: GridPosition, radius: number): GridPosition[] {
    const result: GridPosition[] = [];
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        const p = { x: x, y: y };
        if (board.inBounds(p)) {
          result.push(p);
        }
      }
    }
    return result;
  }

  private key(position: GridPosition): string {
    return position.x + ":" + position.y;
  }

  private toArray(record: Record<string, GridPosition>): GridPosition[] {
    const arr: GridPosition[] = [];
    const keys = Object.keys(record);
    for (let i = 0; i < keys.length; i++) {
      arr.push(record[keys[i]]);
    }
    return arr;
  }
}
