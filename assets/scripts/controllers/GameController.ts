import { BoardModel } from "../models/BoardModel";
import { BoosterState, BoosterType, GameState, GridPosition, LevelConfig, SpecialTileType } from "../models/types";
import { BoosterService } from "../services/BoosterService";
import { GravityResolver } from "../services/GravityResolver";
import { GroupFinder } from "../services/GroupFinder";
import { RulesEngine } from "../services/RulesEngine";
import { ShuffleService } from "../services/ShuffleService";
import { SpawnResolver } from "../services/SpawnResolver";
import { SpecialTileFactory } from "../services/SpecialTileFactory";
import BoardView from "../ui/BoardView";
import HudPresenter from "../ui/HudPresenter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
  @property(cc.JsonAsset)
  levelConfigAsset: cc.JsonAsset = null as any;

  @property(BoardView)
  boardView: BoardView = null as any;

  @property(HudPresenter)
  hudPresenter: HudPresenter = null as any;

  private levelConfig: LevelConfig = null as any;
  private board: BoardModel = null as any;
  private rules: RulesEngine = null as any;
  private boosterService: BoosterService = null as any;
  private gameState: GameState = null as any;
  private loadingDone = false;
  private moveAnimationInProgress = false;

  onLoad(): void {
    if (!this.levelConfigAsset) {
      cc.error("Level config asset is not assigned");
      return;
    }
    this.levelConfig = this.levelConfigAsset.json as LevelConfig;
    this.initializeGame();
  }

  private initializeGame(): void {
    if (!this.boardView || !this.hudPresenter) {
      cc.error("Scene bindings not found");
      return;
    }
    if (!this.boardView.isConfigured(this.levelConfig.colors)) {
      cc.error("BoardView is not configured");
      return;
    }
    if (!this.hudPresenter.isConfigured()) {
      cc.error("HudPresenter is not configured");
      return;
    }

    this.rules = new RulesEngine(
      new GroupFinder(),
      new GravityResolver(),
      new SpawnResolver(),
      new ShuffleService(),
      new SpecialTileFactory()
    );
    this.boosterService = new BoosterService(this.levelConfig.boosterBombCount, this.levelConfig.boosterTeleportCount);
    this.board = new BoardModel(this.levelConfig.width, this.levelConfig.height);
    this.rules.createInitial(this.board, this.levelConfig, Math.random);
    this.gameState = {
      score: 0,
      targetScore: this.levelConfig.targetScore,
      movesLeft: this.levelConfig.startMoves,
      shufflesLeft: this.levelConfig.maxShuffles,
      isWin: false,
      isLose: false,
    };

    if (!this.boardView.configure(this.levelConfig, (position) => this.handleFieldTap(position))) {
      cc.error("BoardView is not configured");
      return;
    }
    this.hudPresenter.bindSlotClicks(this.handleBombToggle, this.handleTeleportToggle, this);

    this.ensureMovesOrLose();
    this.render();
    this.loadingDone = true;
  }

  onDestroy(): void {
    if (!this.hudPresenter) {
      return;
    }
    this.hudPresenter.unbindSlotClicks(this.handleBombToggle, this.handleTeleportToggle, this);
  }

  private handleBombToggle(): void {
    if (this.isInteractionBlocked()) {
      return;
    }
    this.boosterService.activate(BoosterType.Bomb);
    this.renderHud();
  }

  private handleTeleportToggle(): void {
    if (this.isInteractionBlocked()) {
      return;
    }
    this.boosterService.activate(BoosterType.Teleport);
    this.renderHud();
  }

  private async handleFieldTap(position: GridPosition): Promise<void> {
    if (this.isInteractionBlocked()) {
      return;
    }

    const boosterState = this.boosterService.getState();
    if (boosterState.active === BoosterType.Bomb) {
      await this.runLocked(() => this.boardView.playBoosterBombEffect(position, this.levelConfig.boosterBombRadius));
      if (!this.boosterService.consumeBomb()) {
        return;
      }
      const bombResult = this.rules.applyBombBooster(this.board, position, this.levelConfig);
      if (bombResult.isValid) {
        this.applyMoveResult(false, bombResult.scoreDelta);
      }
      this.render();
      return;
    }

    if (boosterState.active === BoosterType.Teleport) {
      this.handleTeleport(position, boosterState);
      return;
    }

    const clickedTile = this.board.get(position);
    const result = this.rules.processTap(this.board, position, this.levelConfig);
    if (!result.isValid) {
      await this.runLocked(() => this.boardView.playMissClickAnimation(position));
      return;
    }
    const clickedWasSpecial = !!clickedTile && clickedTile.special !== SpecialTileType.None;
    if (clickedWasSpecial && clickedTile) {
      await this.runLocked(() => this.boardView.playSpecialActivationEffect(position, clickedTile.special));
    }
    if (!clickedWasSpecial && result.removed.length > 0) {
      const destroyTargets = result.removed.slice();
      if (result.spawnedSpecial) {
        destroyTargets.push(result.spawnedSpecial.position);
      }
      await this.runLocked(() => this.boardView.playDestroyAnimation(destroyTargets));
    }
    this.boardView.setSpecialSpawnHint(result.spawnedSpecial ? result.spawnedSpecial.position : null);
    this.applyMoveResult(result.consumedMove, result.scoreDelta);
    this.render();
  }

  private handleTeleport(position: GridPosition, boosterState: BoosterState): void {
    if (!boosterState.teleportFirstPick) {
      this.boosterService.setTeleportFirstPick(position);
      this.renderHud();
      return;
    }
    const success = this.rules.applyTeleport(this.board, boosterState.teleportFirstPick, position);
    if (!success) {
      this.boosterService.clearActive();
      this.renderHud();
      return;
    }
    const consumed = this.boosterService.consumeTeleport();
    if (!consumed) {
      return;
    }
    this.applyMoveResult(false, 0);
    this.render();
  }

  private applyMoveResult(consumedMove: boolean, scoreDelta: number): void {
    if (consumedMove) {
      this.gameState.movesLeft--;
    }
    this.gameState.score += scoreDelta;

    if (this.gameState.score >= this.gameState.targetScore) {
      this.gameState.isWin = true;
      return;
    }
    if (this.gameState.movesLeft <= 0) {
      this.gameState.isLose = true;
      return;
    }
    this.ensureMovesOrLose();
  }

  private ensureMovesOrLose(): void {
    if (this.rules.hasAnyMoves(this.board, this.levelConfig)) {
      return;
    }
    const outcome = this.rules.ensureHasMoves(this.board, this.levelConfig, this.gameState.shufflesLeft, Math.random);
    this.gameState.shufflesLeft -= outcome.usedShuffles;
    if (!this.rules.hasAnyMoves(this.board, this.levelConfig) && this.gameState.shufflesLeft <= 0) {
      this.gameState.isLose = true;
    }
  }

  private render(): void {
    this.boardView.renderBoard(this.board);
    this.renderHud();
  }

  private renderHud(): void {
    this.hudPresenter.render(this.gameState, this.boosterService.getState());
    this.hudPresenter.showFinish(this.gameState);
  }

  private isInteractionBlocked(): boolean {
    return !this.loadingDone || this.moveAnimationInProgress || this.gameState.isWin || this.gameState.isLose;
  }

  private async runLocked(action: () => Promise<void>): Promise<void> {
    this.moveAnimationInProgress = true;
    try {
      await action();
    } finally {
      this.moveAnimationInProgress = false;
    }
  }

}
