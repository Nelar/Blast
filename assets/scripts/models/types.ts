export enum TileColor {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Purple = "purple",
}

export enum SpecialTileType {
  None = "none",
  RocketHorizontal = "rocket_horizontal",
  RocketVertical = "rocket_vertical",
  Bomb = "bomb",
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface TileData {
  id: number;
  color: TileColor;
  special: SpecialTileType;
}

export interface LevelConfig {
  width: number;
  height: number;
  targetScore: number;
  startMoves: number;
  minGroupSize: number;
  maxShuffles: number;
  boosterBombRadius: number;
  tileBombRadius: number;
  superTileLineRequirement: number;
  scorePerTile: number;
  scoreSpecialMultiplier: number;
  boosterBombCount: number;
  boosterTeleportCount: number;
  colors: TileColor[];
}

export interface GameState {
  score: number;
  targetScore: number;
  movesLeft: number;
  shufflesLeft: number;
  isWin: boolean;
  isLose: boolean;
}

export enum BoosterType {
  None = "none",
  Bomb = "bomb",
  Teleport = "teleport",
}

export interface BoosterState {
  active: BoosterType;
  bombCount: number;
  teleportCount: number;
  teleportFirstPick: GridPosition | null;
}

export interface MoveResult {
  isValid: boolean;
  consumedMove: boolean;
  removed: GridPosition[];
  scoreDelta: number;
  spawnedSpecial: {
    position: GridPosition;
    special: SpecialTileType;
  } | null;
}
