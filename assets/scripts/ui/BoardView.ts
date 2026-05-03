import { BoardModel } from "../models/BoardModel";
import { GridPosition, LevelConfig, SpecialTileType, TileData, TileColor } from "../models/types";
import TileView from "./TileView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoardView extends cc.Component {
  @property(cc.Prefab)
  redTilePrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  blueTilePrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  greenTilePrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  yellowTilePrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  purpleTilePrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  rocketHorizontalPrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  rocketVerticalPrefab: cc.Prefab = null as any;

  @property(cc.Prefab)
  bombPrefab: cc.Prefab = null as any;

  @property
  tileSize = 110;

  @property
  tileGapX = -10;

  @property
  tileGapY = -10;

  @property
  paddingTop = 0;

  @property
  paddingBottom = 0;

  @property
  paddingLeft = 0;

  @property
  paddingRight = 0;

  @property
  fallTweenDuration = 0.2;

  @property
  fallDistanceExponent = 0.65;

  @property
  fallMinDuration = 0.12;

  @property
  fallMaxDuration = 0.8;

  @property
  fallTweenEasing = "quadOut";

  @property
  spawnOffsetY = 180;

  @property
  lineBlastTileHideDuration = 0.1;

  @property
  lineBlastTileHideEasing = "sineIn";

  @property
  bombImpactHideDuration = 0.05;

  private readonly slots: Record<string, cc.Node> = {};
  private readonly tileNodesById: Record<number, cc.Node> = {};
  private readonly prefabByTileId: Record<number, string> = {};
  private readonly tileIdByCell: Record<string, number> = {};
  private levelConfig: LevelConfig = null as any;
  private onTap: ((position: GridPosition) => void) | null = null;
  private specialSpawnHint: GridPosition | null = null;

  isConfigured(colors?: TileColor[]): boolean {
    const checkColors = colors || [TileColor.Red, TileColor.Blue, TileColor.Green, TileColor.Yellow, TileColor.Purple];
    return this.validatePrefabs(checkColors);
  }

  configure(levelConfig: LevelConfig, onTap: (position: GridPosition) => void): boolean {
    this.levelConfig = levelConfig;
    this.onTap = onTap;
    if (!this.isConfigured(levelConfig.colors)) {
      return false;
    }
    this.resizeNodeToLevel();
    this.buildSlots();
    return true;
  }

  renderBoard(board: BoardModel): void {
    if (!this.levelConfig) {
      return;
    }
    const spawnRanks = this.collectSpawnRanks(board);
    let activeIds: Record<number, boolean> = {};
    let nextTileIdByCell: Record<string, number> = {};
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const position = { x: x, y: y };
        const tile = board.get(position);
        if (!tile) {
          continue;
        }
        activeIds[tile.id] = true;
        nextTileIdByCell[this.key(position)] = tile.id;
        this.renderTile(position, tile, spawnRanks[tile.id]);
      }
    }
    const existingIds = Object.keys(this.tileNodesById);
    for (let i = 0; i < existingIds.length; i++) {
      const id = parseInt(existingIds[i], 10);
      if (activeIds[id]) {
        continue;
      }
      const node = this.tileNodesById[id];
      if (node && node.isValid) {
        cc.Tween.stopAllByTarget(node);
        node.destroy();
      }
      delete this.tileNodesById[id];
      delete this.prefabByTileId[id];
    }
    this.replaceCellMap(nextTileIdByCell);
  }

  setSpecialSpawnHint(position: GridPosition | null): void {
    this.specialSpawnHint = position;
  }

  playDestroyAnimation(positions: GridPosition[]): Promise<void> {
    let ids: Record<number, boolean> = {};
    for (let i = 0; i < positions.length; i++) {
      const cellId = this.getTileIdAt(positions[i]);
      if (typeof cellId === "number") {
        ids[cellId] = true;
      }
    }
    const keys = Object.keys(ids);
    if (keys.length === 0) {
      return Promise.resolve();
    }
    const tasks: Array<Promise<void>> = [];
    for (let idx = 0; idx < keys.length; idx++) {
      const id = parseInt(keys[idx], 10);
      const node = this.tileNodesById[id];
      tasks.push(this.playDestroyOnNode(node));
    }
    return Promise.all(tasks).then((): void => {});
  }

  playMissClickAnimation(position: GridPosition): Promise<void> {
    const tileId = this.getTileIdAt(position);
    if (typeof tileId !== "number") {
      return Promise.resolve();
    }
    const node = this.getTileNodeById(tileId);
    if (!node || !node.isValid) {
      return Promise.resolve();
    }
    const tileView = node.getComponent(TileView);
    if (tileView) {
      return tileView.playMissClickAnimation();
    }
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(node);
      node.setScale(1, 1);
      cc.tween(node)
        .to(0.07, { scale: 1.08 }, { easing: "sineOut" })
        .to(0.09, { scale: 1 }, { easing: "sineIn" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }

  playSpecialActivationEffect(position: GridPosition, special: SpecialTileType): Promise<void> {
    const tileId = this.getTileIdAt(position);
    if (typeof tileId !== "number") {
      return Promise.resolve();
    }
    const node = this.getTileNodeById(tileId);
    if (!node || !node.isValid) {
      return Promise.resolve();
    }
    const tileView = node.getComponent(TileView);
    if (special === SpecialTileType.Bomb) {
      const stepXBomb = this.tileSize + this.tileGapX;
      const stepYBomb = this.tileSize + this.tileGapY;
      if (!tileView) {
        return Promise.resolve();
      }
      return tileView.playBombBlastEffect(
        this.levelConfig.tileBombRadius,
        stepXBomb,
        stepYBomb,
        (): void => {
          this.hideBombAreaAtImpact(position, this.levelConfig.tileBombRadius);
        }
      );
    }
    if (!tileView) {
      return Promise.resolve();
    }
    if (special !== SpecialTileType.RocketHorizontal && special !== SpecialTileType.RocketVertical) {
      return Promise.resolve();
    }
    const isHorizontal = special === SpecialTileType.RocketHorizontal;
    const rocketDuration = Math.max(0.01, tileView.rocketFlyDuration);
    let rocketTask: Promise<void>;
    if (isHorizontal) {
      const stepX = this.tileSize + this.tileGapX;
      const leftDistance = (position.x + 1) * stepX;
      const rightDistance = (this.levelConfig.width - position.x) * stepX;
      rocketTask = tileView.playLineBlastEffect(true, leftDistance, rightDistance);
    } else {
      const stepY = this.tileSize + this.tileGapY;
      const downDistance = (position.y + 1) * stepY;
      const upDistance = (this.levelConfig.height - position.y) * stepY;
      rocketTask = tileView.playLineBlastEffect(false, downDistance, upDistance);
    }

    const lineTasks = this.playLineDisappearAlongPath(position, isHorizontal, rocketDuration);
    const tasks: Array<Promise<void>> = [rocketTask];
    for (let i = 0; i < lineTasks.length; i++) {
      tasks.push(lineTasks[i]);
    }
    return Promise.all(tasks).then((): void => {});
  }

  playBoosterBombEffect(position: GridPosition, radius: number): Promise<void> {
    const tileId = this.getTileIdAt(position);
    if (typeof tileId !== "number") {
      return Promise.resolve();
    }
    const node = this.getTileNodeById(tileId);
    if (!node || !node.isValid) {
      return Promise.resolve();
    }
    const tileView = node.getComponent(TileView);
    if (!tileView) {
      return Promise.resolve();
    }
    const stepX = this.tileSize + this.tileGapX;
    const stepY = this.tileSize + this.tileGapY;
    return tileView.playBombBlastEffect(
      radius,
      stepX,
      stepY,
      (): void => {
        this.hideBombAreaAtImpact(position, radius);
      }
    );
  }

  private buildSlots(): void {
    this.clearSlots();
    this.clearTileNodes();
    for (let y = 0; y < this.levelConfig.height; y++) {
      for (let x = 0; x < this.levelConfig.width; x++) {
        const position = { x: x, y: y };
        const slotNode = new cc.Node("slot_" + x + "_" + y);
        slotNode.parent = this.node;
        slotNode.setContentSize(this.tileSize, this.tileSize);
        slotNode.position = this.gridToPosition(position);
        slotNode.opacity = 0;
        slotNode.zIndex = 1;
        slotNode.on(
          cc.Node.EventType.TOUCH_END,
          (): void => {
            if (this.onTap) {
              this.onTap(position);
            }
          }
        );
        this.slots[this.key(position)] = slotNode;
      }
    }
  }

  private renderTile(position: GridPosition, tile: TileData, spawnRank?: number): void {
    const prefab = this.pickPrefab(tile);
    if (!prefab) {
      return;
    }
    let node = this.tileNodesById[tile.id];
    const prefabName = prefab.name;
    if (node && this.prefabByTileId[tile.id] !== prefabName) {
      const oldPosition = node.position.clone();
      cc.Tween.stopAllByTarget(node);
      node.destroy();
      delete this.tileNodesById[tile.id];
      delete this.prefabByTileId[tile.id];
      node = this.createTileNode(prefab, oldPosition);
      this.tileNodesById[tile.id] = node;
      this.prefabByTileId[tile.id] = prefabName;
    }
    if (!node) {
      let start = this.gridToPosition(position);
      if (tile.special !== SpecialTileType.None && this.specialSpawnHint) {
        start = this.gridToPosition(this.specialSpawnHint);
        this.specialSpawnHint = null;
      } else if (typeof spawnRank === "number") {
        start = this.spawnStartPosition(position, spawnRank);
      }
      node = this.createTileNode(prefab, start);
      this.tileNodesById[tile.id] = node;
      this.prefabByTileId[tile.id] = prefabName;
    }
    const target = this.gridToPosition(position);
    if (this.fallTweenDuration <= 0) {
      node.setPosition(target);
      return;
    }
    const duration = this.computeFallDuration(node.position, target);
    cc.Tween.stopAllByTarget(node);
    cc.tween(node).to(duration, { position: target }, { easing: this.fallTweenEasing || "quadOut" }).start();
  }

  private createTileNode(prefab: cc.Prefab, position: cc.Vec3): cc.Node {
    const node = cc.instantiate(prefab);
    node.parent = this.node;
    node.zIndex = 10;
    node.setPosition(position);
    return node;
  }

  private playDestroyOnNode(node: cc.Node | undefined): Promise<void> {
    if (!node || !node.isValid) {
      return Promise.resolve();
    }
    const tileView = node.getComponent(TileView);
    if (tileView) {
      return tileView.playDestroyAnimation();
    }
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(node);
      node.setScale(1, 1);
      cc.tween(node)
        .to(0.07, { scale: 1.08 }, { easing: "sineOut" })
        .to(0.13, { scale: 0 }, { easing: "sineIn" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }

  private playLineDisappearAlongPath(center: GridPosition, isHorizontal: boolean, rocketDuration: number): Array<Promise<void>> {
    const positions: GridPosition[] = [];
    if (isHorizontal) {
      for (let x = 0; x < this.levelConfig.width; x++) {
        positions.push({ x: x, y: center.y });
      }
    } else {
      for (let y = 0; y < this.levelConfig.height; y++) {
        positions.push({ x: center.x, y: y });
      }
    }
    let maxDistance = 0;
    for (let i = 0; i < positions.length; i++) {
      const d = isHorizontal ? Math.abs(positions[i].x - center.x) : Math.abs(positions[i].y - center.y);
      if (d > maxDistance) {
        maxDistance = d;
      }
    }
    const tasks: Array<Promise<void>> = [];
    for (let j = 0; j < positions.length; j++) {
      if (positions[j].x === center.x && positions[j].y === center.y) {
        continue;
      }
      const tileId = this.getTileIdAt(positions[j]);
      if (typeof tileId !== "number") {
        continue;
      }
      const node = this.getTileNodeById(tileId);
      if (!node || !node.isValid) {
        continue;
      }
      const distance = isHorizontal ? Math.abs(positions[j].x - center.x) : Math.abs(positions[j].y - center.y);
      const delay = maxDistance > 0 ? (distance / maxDistance) * rocketDuration : 0;
      tasks.push(this.playLineTileHide(node, delay));
    }
    return tasks;
  }

  private playLineTileHide(node: cc.Node, delay: number): Promise<void> {
    const duration = Math.max(0.01, this.lineBlastTileHideDuration);
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(node);
      cc.tween(node)
        .delay(Math.max(0, delay))
        .to(duration, { scale: 0 }, { easing: this.lineBlastTileHideEasing || "sineIn" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }

  private hideBombAreaAtImpact(center: GridPosition, radius: number): void {
    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        if (x < 0 || x >= this.levelConfig.width || y < 0 || y >= this.levelConfig.height) {
          continue;
        }
        if (x === center.x && y === center.y) {
          continue;
        }
        const id = this.getTileIdAt({ x: x, y: y });
        if (typeof id !== "number") {
          continue;
        }
        const node = this.getTileNodeById(id);
        if (!node || !node.isValid) {
          continue;
        }
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
          .to(Math.max(0.01, this.bombImpactHideDuration), { scale: 0 }, { easing: "sineIn" })
          .start();
      }
    }
  }

  private pickPrefab(tile: TileData): cc.Prefab | null {
    if (tile.special !== SpecialTileType.None) {
      return this.specialPrefab(tile.special);
    }
    return this.normalPrefab(tile.color);
  }

  private gridToPosition(position: GridPosition): cc.Vec3 {
    const left = -this.node.width / 2 + Math.max(0, this.paddingLeft) + this.tileSize / 2;
    const bottom = -this.node.height / 2 + Math.max(0, this.paddingBottom) + this.tileSize / 2;
    const x = left + position.x * (this.tileSize + this.tileGapX);
    const y = bottom + position.y * (this.tileSize + this.tileGapY);
    return cc.v3(x, y, 0);
  }

  private spawnStartPosition(position: GridPosition, spawnRank: number): cc.Vec3 {
    const target = this.gridToPosition(position);
    const topTarget = this.gridToPosition({ x: position.x, y: this.levelConfig.height - 1 });
    const stepY = this.tileSize + this.tileGapY;
    const y = topTarget.y + (spawnRank + 1) * stepY + Math.max(0, this.spawnOffsetY);
    return cc.v3(target.x, y, 0);
  }

  private computeFallDuration(from: cc.Vec3, to: cc.Vec3): number {
    const stepX = this.tileSize + this.tileGapX;
    const stepY = this.tileSize + this.tileGapY;
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const cellsX = stepX > 0 ? dx / stepX : 0;
    const cellsY = stepY > 0 ? dy / stepY : 0;
    const cells = Math.max(1, Math.max(cellsX, cellsY));
    const exponent = Math.max(0.1, this.fallDistanceExponent);
    let duration = this.fallTweenDuration * Math.pow(cells, exponent);
    duration = Math.max(Math.max(0, this.fallMinDuration), duration);
    if (this.fallMaxDuration > 0) {
      duration = Math.min(this.fallMaxDuration, duration);
    }
    return duration;
  }

  private collectSpawnRanks(board: BoardModel): Record<number, number> {
    let oldMaxYByColumn: Record<number, number> = {};
    let newByColumn: Record<number, Array<{ id: number; y: number }>> = {};

    for (let x = 0; x < board.width; x++) {
      oldMaxYByColumn[x] = -1;
    }

    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        const tile = board.get({ x: x, y: y });
        if (!tile) {
          continue;
        }
        if (this.tileNodesById[tile.id]) {
          if (y > oldMaxYByColumn[x]) {
            oldMaxYByColumn[x] = y;
          }
          continue;
        }
        if (!newByColumn[x]) {
          newByColumn[x] = [];
        }
        newByColumn[x].push({ id: tile.id, y: y });
      }
    }

    let ranks: Record<number, number> = {};
    const columns = Object.keys(newByColumn);
    for (let i = 0; i < columns.length; i++) {
      const column = parseInt(columns[i], 10);
      const columnTiles = newByColumn[column];
      let spawnedFromTop: Array<{ id: number; y: number }> = [];
      for (let j = 0; j < columnTiles.length; j++) {
        if (columnTiles[j].y > oldMaxYByColumn[column]) {
          spawnedFromTop.push(columnTiles[j]);
        }
      }
      spawnedFromTop.sort((a: { id: number; y: number }, b: { id: number; y: number }): number => {
        return a.y - b.y;
      });
      for (let rank = 0; rank < spawnedFromTop.length; rank++) {
        ranks[spawnedFromTop[rank].id] = rank;
      }
    }
    return ranks;
  }

  private resizeNodeToLevel(): void {
    const boardWidth = this.levelConfig.width * this.tileSize + (this.levelConfig.width - 1) * this.tileGapX;
    const boardHeight = this.levelConfig.height * this.tileSize + (this.levelConfig.height - 1) * this.tileGapY;
    const width = boardWidth + Math.max(0, this.paddingLeft) + Math.max(0, this.paddingRight);
    const height = boardHeight + Math.max(0, this.paddingTop) + Math.max(0, this.paddingBottom);
    this.node.setContentSize(width, height);
  }

  private clearSlots(): void {
    const keys = Object.keys(this.slots);
    for (let i = 0; i < keys.length; i++) {
      const slot = this.slots[keys[i]];
      if (slot && slot.isValid) {
        slot.off(cc.Node.EventType.TOUCH_END);
        slot.destroy();
      }
      delete this.slots[keys[i]];
    }
  }

  private clearTileNodes(): void {
    const ids = Object.keys(this.tileNodesById);
    for (let i = 0; i < ids.length; i++) {
      const id = parseInt(ids[i], 10);
      const node = this.tileNodesById[id];
      if (node && node.isValid) {
        cc.Tween.stopAllByTarget(node);
        node.destroy();
      }
      delete this.tileNodesById[id];
      delete this.prefabByTileId[id];
    }
  }

  private validatePrefabs(colors: TileColor[]): boolean {
    for (let i = 0; i < colors.length; i++) {
      if (!this.normalPrefab(colors[i])) {
        return false;
      }
    }
    if (!this.rocketHorizontalPrefab || !this.rocketVerticalPrefab || !this.bombPrefab) {
      return false;
    }
    return true;
  }

  private normalPrefab(color: TileColor): cc.Prefab | null {
    if (color === TileColor.Red) {
      return this.redTilePrefab;
    }
    if (color === TileColor.Blue) {
      return this.blueTilePrefab;
    }
    if (color === TileColor.Green) {
      return this.greenTilePrefab;
    }
    if (color === TileColor.Yellow) {
      return this.yellowTilePrefab;
    }
    if (color === TileColor.Purple) {
      return this.purpleTilePrefab;
    }
    return null;
  }

  private specialPrefab(special: Exclude<SpecialTileType, SpecialTileType.None>): cc.Prefab | null {
    if (special === SpecialTileType.RocketHorizontal) {
      return this.rocketHorizontalPrefab;
    }
    if (special === SpecialTileType.RocketVertical) {
      return this.rocketVerticalPrefab;
    }
    return this.bombPrefab;
  }

  private key(position: GridPosition): string {
    return position.x + ":" + position.y;
  }

  private getTileIdAt(position: GridPosition): number | undefined {
    return this.tileIdByCell[this.key(position)];
  }

  private getTileNodeById(tileId: number): cc.Node | undefined {
    return this.tileNodesById[tileId];
  }

  private replaceCellMap(nextTileIdByCell: Record<string, number>): void {
    const cellKeys = Object.keys(this.tileIdByCell);
    for (let i = 0; i < cellKeys.length; i++) {
      delete this.tileIdByCell[cellKeys[i]];
    }
    const nextKeys = Object.keys(nextTileIdByCell);
    for (let j = 0; j < nextKeys.length; j++) {
      this.tileIdByCell[nextKeys[j]] = nextTileIdByCell[nextKeys[j]];
    }
  }

  onDestroy(): void {
    this.clearSlots();
    this.clearTileNodes();
  }
}
