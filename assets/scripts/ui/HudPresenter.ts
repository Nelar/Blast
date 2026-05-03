import { BoosterState, BoosterType, GameState } from "../models/types";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HudPresenter extends cc.Component {
  @property(cc.Label)
  movesLabel: cc.Label = null as any;

  @property(cc.Label)
  scoreLabel: cc.Label = null as any;

  @property(cc.Label)
  bombCountLabel: cc.Label = null as any;

  @property(cc.Label)
  teleportCountLabel: cc.Label = null as any;

  @property(cc.Node)
  slotBombNode: cc.Node = null as any;

  @property(cc.Node)
  slotTeleportNode: cc.Node = null as any;

  @property(cc.Node)
  winPanel: cc.Node = null as any;

  @property(cc.Node)
  losePanel: cc.Node = null as any;

  @property
  scoreAnimDuration = 0.35;

  @property
  scoreAnimPower = 2;

  private scoreInitialized = false;
  private displayedScore = 0;
  private scoreFrom = 0;
  private scoreTo = 0;
  private scoreAnimElapsed = 0;
  private scoreAnimActive = false;
  private lastTargetScore = 0;

  isConfigured(): boolean {
    return !!(
      this.movesLabel &&
      this.scoreLabel &&
      this.bombCountLabel &&
      this.teleportCountLabel &&
      this.slotBombNode &&
      this.slotTeleportNode &&
      this.winPanel &&
      this.losePanel
    );
  }

  getSlotBombNode(): cc.Node {
    return this.slotBombNode;
  }

  getSlotTeleportNode(): cc.Node {
    return this.slotTeleportNode;
  }

  bindSlotClicks(onBombTap: () => void, onTeleportTap: () => void, target?: unknown): void {
    if (this.slotBombNode && this.slotBombNode.isValid) {
      this.slotBombNode.on(cc.Node.EventType.TOUCH_END, onBombTap, target);
    }
    if (this.slotTeleportNode && this.slotTeleportNode.isValid) {
      this.slotTeleportNode.on(cc.Node.EventType.TOUCH_END, onTeleportTap, target);
    }
  }

  unbindSlotClicks(onBombTap: () => void, onTeleportTap: () => void, target?: unknown): void {
    if (this.slotBombNode && this.slotBombNode.isValid) {
      this.slotBombNode.off(cc.Node.EventType.TOUCH_END, onBombTap, target);
    }
    if (this.slotTeleportNode && this.slotTeleportNode.isValid) {
      this.slotTeleportNode.off(cc.Node.EventType.TOUCH_END, onTeleportTap, target);
    }
  }

  render(gameState: GameState, boosterState: BoosterState): void {
    this.movesLabel.string = String(gameState.movesLeft);
    this.lastTargetScore = gameState.targetScore;
    this.updateScore(gameState.score, gameState.targetScore);
    this.bombCountLabel.string = String(boosterState.bombCount);
    this.teleportCountLabel.string = String(boosterState.teleportCount);
    this.slotBombNode.opacity = boosterState.active === BoosterType.Bomb ? 180 : 255;
    this.slotTeleportNode.opacity = boosterState.active === BoosterType.Teleport ? 180 : 255;
  }

  showFinish(gameState: GameState): void {
    if (gameState.isWin) {
      this.winPanel.active = true;
      return;
    }
    if (gameState.isLose) {
      this.losePanel.active = true;
    }
  }

  restart(): void {
    const scene = cc.director.getScene();
    if (!scene || !scene.name) {
      return;
    }
    cc.director.loadScene(scene.name);
  }

  update(dt: number): void {
    if (!this.scoreAnimActive) {
      return;
    }
    const duration = Math.max(0.001, this.scoreAnimDuration);
    this.scoreAnimElapsed += dt;
    let t = this.scoreAnimElapsed / duration;
    if (t >= 1) {
      t = 1;
      this.scoreAnimActive = false;
    }
    const power = Math.max(1, this.scoreAnimPower);
    const eased = Math.pow(t, power);
    const value = this.scoreFrom + (this.scoreTo - this.scoreFrom) * eased;
    this.displayedScore = value;
    this.syncScoreLabel(this.displayedScore, this.lastTargetScore);
  }

  private updateScore(score: number, targetScore: number): void {
    if (!this.scoreInitialized) {
      this.scoreInitialized = true;
      this.displayedScore = score;
      this.scoreFrom = score;
      this.scoreTo = score;
      this.scoreAnimElapsed = 0;
      this.scoreAnimActive = false;
      this.syncScoreLabel(this.displayedScore, targetScore);
      return;
    }
    if (score === this.scoreTo) {
      this.syncScoreLabel(this.displayedScore, targetScore);
      return;
    }
    this.scoreFrom = this.displayedScore;
    this.scoreTo = score;
    this.scoreAnimElapsed = 0;
    this.scoreAnimActive = true;
  }

  private syncScoreLabel(score: number, targetScore: number): void {
    this.scoreLabel.string = Math.round(score) + "/" + targetScore;
  }
}
