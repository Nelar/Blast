import { BoosterState, BoosterType, GridPosition } from "../models/types";

export class BoosterService {
  private state: BoosterState;

  constructor(bombCount: number, teleportCount: number) {
    this.state = {
      active: BoosterType.None,
      bombCount: bombCount,
      teleportCount: teleportCount,
      teleportFirstPick: null,
    };
  }

  getState(): BoosterState {
    return {
      active: this.state.active,
      bombCount: this.state.bombCount,
      teleportCount: this.state.teleportCount,
      teleportFirstPick: this.state.teleportFirstPick ? { x: this.state.teleportFirstPick.x, y: this.state.teleportFirstPick.y } : null,
    };
  }

  activate(type: BoosterType): boolean {
    if (type === BoosterType.Bomb && this.state.bombCount <= 0) {
      return false;
    }
    if (type === BoosterType.Teleport && this.state.teleportCount <= 0) {
      return false;
    }
    this.state.active = type;
    this.state.teleportFirstPick = null;
    return true;
  }

  clearActive(): void {
    this.state.active = BoosterType.None;
    this.state.teleportFirstPick = null;
  }

  consumeBomb(): boolean {
    if (this.state.bombCount <= 0) {
      return false;
    }
    this.state.bombCount--;
    this.clearActive();
    return true;
  }

  setTeleportFirstPick(position: GridPosition): void {
    this.state.teleportFirstPick = position;
  }

  consumeTeleport(): boolean {
    if (this.state.teleportCount <= 0) {
      return false;
    }
    this.state.teleportCount--;
    this.clearActive();
    return true;
  }
}
