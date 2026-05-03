"use strict";
cc._RF.push(module, 'fe899CsD85Coamy/YaTWP+T', 'BoardView');
// scripts/ui/BoardView.ts

"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../models/types");
var TileView_1 = require("./TileView");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var BoardView = /** @class */ (function (_super) {
    __extends(BoardView, _super);
    function BoardView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.redTilePrefab = null;
        _this.blueTilePrefab = null;
        _this.greenTilePrefab = null;
        _this.yellowTilePrefab = null;
        _this.purpleTilePrefab = null;
        _this.rocketHorizontalPrefab = null;
        _this.rocketVerticalPrefab = null;
        _this.bombPrefab = null;
        _this.tileSize = 110;
        _this.tileGapX = -10;
        _this.tileGapY = -10;
        _this.paddingTop = 0;
        _this.paddingBottom = 0;
        _this.paddingLeft = 0;
        _this.paddingRight = 0;
        _this.fallTweenDuration = 0.2;
        _this.fallDistanceExponent = 0.65;
        _this.fallMinDuration = 0.12;
        _this.fallMaxDuration = 0.8;
        _this.fallTweenEasing = "quadOut";
        _this.spawnOffsetY = 180;
        _this.lineBlastTileHideDuration = 0.1;
        _this.lineBlastTileHideEasing = "sineIn";
        _this.bombImpactHideDuration = 0.05;
        _this.slots = {};
        _this.tileNodesById = {};
        _this.prefabByTileId = {};
        _this.tileIdByCell = {};
        _this.levelConfig = null;
        _this.onTap = null;
        _this.specialSpawnHint = null;
        return _this;
    }
    BoardView.prototype.isConfigured = function (colors) {
        var checkColors = colors || [types_1.TileColor.Red, types_1.TileColor.Blue, types_1.TileColor.Green, types_1.TileColor.Yellow, types_1.TileColor.Purple];
        return this.validatePrefabs(checkColors);
    };
    BoardView.prototype.configure = function (levelConfig, onTap) {
        this.levelConfig = levelConfig;
        this.onTap = onTap;
        if (!this.isConfigured(levelConfig.colors)) {
            return false;
        }
        this.resizeNodeToLevel();
        this.buildSlots();
        return true;
    };
    BoardView.prototype.renderBoard = function (board) {
        if (!this.levelConfig) {
            return;
        }
        var spawnRanks = this.collectSpawnRanks(board);
        var activeIds = {};
        var nextTileIdByCell = {};
        for (var y = 0; y < board.height; y++) {
            for (var x = 0; x < board.width; x++) {
                var position = { x: x, y: y };
                var tile = board.get(position);
                if (!tile) {
                    continue;
                }
                activeIds[tile.id] = true;
                nextTileIdByCell[this.key(position)] = tile.id;
                this.renderTile(position, tile, spawnRanks[tile.id]);
            }
        }
        var existingIds = Object.keys(this.tileNodesById);
        for (var i = 0; i < existingIds.length; i++) {
            var id = parseInt(existingIds[i], 10);
            if (activeIds[id]) {
                continue;
            }
            var node = this.tileNodesById[id];
            if (node && node.isValid) {
                cc.Tween.stopAllByTarget(node);
                node.destroy();
            }
            delete this.tileNodesById[id];
            delete this.prefabByTileId[id];
        }
        this.replaceCellMap(nextTileIdByCell);
    };
    BoardView.prototype.setSpecialSpawnHint = function (position) {
        this.specialSpawnHint = position;
    };
    BoardView.prototype.playDestroyAnimation = function (positions) {
        var ids = {};
        for (var i = 0; i < positions.length; i++) {
            var cellId = this.getTileIdAt(positions[i]);
            if (typeof cellId === "number") {
                ids[cellId] = true;
            }
        }
        var keys = Object.keys(ids);
        if (keys.length === 0) {
            return Promise.resolve();
        }
        var tasks = [];
        for (var idx = 0; idx < keys.length; idx++) {
            var id = parseInt(keys[idx], 10);
            var node = this.tileNodesById[id];
            tasks.push(this.playDestroyOnNode(node));
        }
        return Promise.all(tasks).then(function () { });
    };
    BoardView.prototype.playMissClickAnimation = function (position) {
        var tileId = this.getTileIdAt(position);
        if (typeof tileId !== "number") {
            return Promise.resolve();
        }
        var node = this.getTileNodeById(tileId);
        if (!node || !node.isValid) {
            return Promise.resolve();
        }
        var tileView = node.getComponent(TileView_1.default);
        if (tileView) {
            return tileView.playMissClickAnimation();
        }
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(node);
            node.setScale(1, 1);
            cc.tween(node)
                .to(0.07, { scale: 1.08 }, { easing: "sineOut" })
                .to(0.09, { scale: 1 }, { easing: "sineIn" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    BoardView.prototype.playSpecialActivationEffect = function (position, special) {
        var _this = this;
        var tileId = this.getTileIdAt(position);
        if (typeof tileId !== "number") {
            return Promise.resolve();
        }
        var node = this.getTileNodeById(tileId);
        if (!node || !node.isValid) {
            return Promise.resolve();
        }
        var tileView = node.getComponent(TileView_1.default);
        if (special === types_1.SpecialTileType.Bomb) {
            var stepXBomb = this.tileSize + this.tileGapX;
            var stepYBomb = this.tileSize + this.tileGapY;
            if (!tileView) {
                return Promise.resolve();
            }
            return tileView.playBombBlastEffect(this.levelConfig.tileBombRadius, stepXBomb, stepYBomb, function () {
                _this.hideBombAreaAtImpact(position, _this.levelConfig.tileBombRadius);
            });
        }
        if (!tileView) {
            return Promise.resolve();
        }
        if (special !== types_1.SpecialTileType.RocketHorizontal && special !== types_1.SpecialTileType.RocketVertical) {
            return Promise.resolve();
        }
        var isHorizontal = special === types_1.SpecialTileType.RocketHorizontal;
        var rocketDuration = Math.max(0.01, tileView.rocketFlyDuration);
        var rocketTask;
        if (isHorizontal) {
            var stepX = this.tileSize + this.tileGapX;
            var leftDistance = (position.x + 1) * stepX;
            var rightDistance = (this.levelConfig.width - position.x) * stepX;
            rocketTask = tileView.playLineBlastEffect(true, leftDistance, rightDistance);
        }
        else {
            var stepY = this.tileSize + this.tileGapY;
            var downDistance = (position.y + 1) * stepY;
            var upDistance = (this.levelConfig.height - position.y) * stepY;
            rocketTask = tileView.playLineBlastEffect(false, downDistance, upDistance);
        }
        var lineTasks = this.playLineDisappearAlongPath(position, isHorizontal, rocketDuration);
        var tasks = [rocketTask];
        for (var i = 0; i < lineTasks.length; i++) {
            tasks.push(lineTasks[i]);
        }
        return Promise.all(tasks).then(function () { });
    };
    BoardView.prototype.playBoosterBombEffect = function (position, radius) {
        var _this = this;
        var tileId = this.getTileIdAt(position);
        if (typeof tileId !== "number") {
            return Promise.resolve();
        }
        var node = this.getTileNodeById(tileId);
        if (!node || !node.isValid) {
            return Promise.resolve();
        }
        var tileView = node.getComponent(TileView_1.default);
        if (!tileView) {
            return Promise.resolve();
        }
        var stepX = this.tileSize + this.tileGapX;
        var stepY = this.tileSize + this.tileGapY;
        return tileView.playBombBlastEffect(radius, stepX, stepY, function () {
            _this.hideBombAreaAtImpact(position, radius);
        });
    };
    BoardView.prototype.buildSlots = function () {
        var _this = this;
        this.clearSlots();
        this.clearTileNodes();
        for (var y = 0; y < this.levelConfig.height; y++) {
            var _loop_1 = function (x) {
                var position = { x: x, y: y };
                var slotNode = new cc.Node("slot_" + x + "_" + y);
                slotNode.parent = this_1.node;
                slotNode.setContentSize(this_1.tileSize, this_1.tileSize);
                slotNode.position = this_1.gridToPosition(position);
                slotNode.opacity = 0;
                slotNode.zIndex = 1;
                slotNode.on(cc.Node.EventType.TOUCH_END, function () {
                    if (_this.onTap) {
                        _this.onTap(position);
                    }
                });
                this_1.slots[this_1.key(position)] = slotNode;
            };
            var this_1 = this;
            for (var x = 0; x < this.levelConfig.width; x++) {
                _loop_1(x);
            }
        }
    };
    BoardView.prototype.renderTile = function (position, tile, spawnRank) {
        var prefab = this.pickPrefab(tile);
        if (!prefab) {
            return;
        }
        var node = this.tileNodesById[tile.id];
        var prefabName = prefab.name;
        if (node && this.prefabByTileId[tile.id] !== prefabName) {
            var oldPosition = node.position.clone();
            cc.Tween.stopAllByTarget(node);
            node.destroy();
            delete this.tileNodesById[tile.id];
            delete this.prefabByTileId[tile.id];
            node = this.createTileNode(prefab, oldPosition);
            this.tileNodesById[tile.id] = node;
            this.prefabByTileId[tile.id] = prefabName;
        }
        if (!node) {
            var start = this.gridToPosition(position);
            if (tile.special !== types_1.SpecialTileType.None && this.specialSpawnHint) {
                start = this.gridToPosition(this.specialSpawnHint);
                this.specialSpawnHint = null;
            }
            else if (typeof spawnRank === "number") {
                start = this.spawnStartPosition(position, spawnRank);
            }
            node = this.createTileNode(prefab, start);
            this.tileNodesById[tile.id] = node;
            this.prefabByTileId[tile.id] = prefabName;
        }
        var target = this.gridToPosition(position);
        if (this.fallTweenDuration <= 0) {
            node.setPosition(target);
            return;
        }
        var duration = this.computeFallDuration(node.position, target);
        cc.Tween.stopAllByTarget(node);
        cc.tween(node).to(duration, { position: target }, { easing: this.fallTweenEasing || "quadOut" }).start();
    };
    BoardView.prototype.createTileNode = function (prefab, position) {
        var node = cc.instantiate(prefab);
        node.parent = this.node;
        node.zIndex = 10;
        node.setPosition(position);
        return node;
    };
    BoardView.prototype.playDestroyOnNode = function (node) {
        if (!node || !node.isValid) {
            return Promise.resolve();
        }
        var tileView = node.getComponent(TileView_1.default);
        if (tileView) {
            return tileView.playDestroyAnimation();
        }
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(node);
            node.setScale(1, 1);
            cc.tween(node)
                .to(0.07, { scale: 1.08 }, { easing: "sineOut" })
                .to(0.13, { scale: 0 }, { easing: "sineIn" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    BoardView.prototype.playLineDisappearAlongPath = function (center, isHorizontal, rocketDuration) {
        var positions = [];
        if (isHorizontal) {
            for (var x = 0; x < this.levelConfig.width; x++) {
                positions.push({ x: x, y: center.y });
            }
        }
        else {
            for (var y = 0; y < this.levelConfig.height; y++) {
                positions.push({ x: center.x, y: y });
            }
        }
        var maxDistance = 0;
        for (var i = 0; i < positions.length; i++) {
            var d = isHorizontal ? Math.abs(positions[i].x - center.x) : Math.abs(positions[i].y - center.y);
            if (d > maxDistance) {
                maxDistance = d;
            }
        }
        var tasks = [];
        for (var j = 0; j < positions.length; j++) {
            if (positions[j].x === center.x && positions[j].y === center.y) {
                continue;
            }
            var tileId = this.getTileIdAt(positions[j]);
            if (typeof tileId !== "number") {
                continue;
            }
            var node = this.getTileNodeById(tileId);
            if (!node || !node.isValid) {
                continue;
            }
            var distance = isHorizontal ? Math.abs(positions[j].x - center.x) : Math.abs(positions[j].y - center.y);
            var delay = maxDistance > 0 ? (distance / maxDistance) * rocketDuration : 0;
            tasks.push(this.playLineTileHide(node, delay));
        }
        return tasks;
    };
    BoardView.prototype.playLineTileHide = function (node, delay) {
        var _this = this;
        var duration = Math.max(0.01, this.lineBlastTileHideDuration);
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(node);
            cc.tween(node)
                .delay(Math.max(0, delay))
                .to(duration, { scale: 0 }, { easing: _this.lineBlastTileHideEasing || "sineIn" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    BoardView.prototype.hideBombAreaAtImpact = function (center, radius) {
        for (var y = center.y - radius; y <= center.y + radius; y++) {
            for (var x = center.x - radius; x <= center.x + radius; x++) {
                if (x < 0 || x >= this.levelConfig.width || y < 0 || y >= this.levelConfig.height) {
                    continue;
                }
                if (x === center.x && y === center.y) {
                    continue;
                }
                var id = this.getTileIdAt({ x: x, y: y });
                if (typeof id !== "number") {
                    continue;
                }
                var node = this.getTileNodeById(id);
                if (!node || !node.isValid) {
                    continue;
                }
                cc.Tween.stopAllByTarget(node);
                cc.tween(node)
                    .to(Math.max(0.01, this.bombImpactHideDuration), { scale: 0 }, { easing: "sineIn" })
                    .start();
            }
        }
    };
    BoardView.prototype.pickPrefab = function (tile) {
        if (tile.special !== types_1.SpecialTileType.None) {
            return this.specialPrefab(tile.special);
        }
        return this.normalPrefab(tile.color);
    };
    BoardView.prototype.gridToPosition = function (position) {
        var left = -this.node.width / 2 + Math.max(0, this.paddingLeft) + this.tileSize / 2;
        var bottom = -this.node.height / 2 + Math.max(0, this.paddingBottom) + this.tileSize / 2;
        var x = left + position.x * (this.tileSize + this.tileGapX);
        var y = bottom + position.y * (this.tileSize + this.tileGapY);
        return cc.v3(x, y, 0);
    };
    BoardView.prototype.spawnStartPosition = function (position, spawnRank) {
        var target = this.gridToPosition(position);
        var topTarget = this.gridToPosition({ x: position.x, y: this.levelConfig.height - 1 });
        var stepY = this.tileSize + this.tileGapY;
        var y = topTarget.y + (spawnRank + 1) * stepY + Math.max(0, this.spawnOffsetY);
        return cc.v3(target.x, y, 0);
    };
    BoardView.prototype.computeFallDuration = function (from, to) {
        var stepX = this.tileSize + this.tileGapX;
        var stepY = this.tileSize + this.tileGapY;
        var dx = Math.abs(to.x - from.x);
        var dy = Math.abs(to.y - from.y);
        var cellsX = stepX > 0 ? dx / stepX : 0;
        var cellsY = stepY > 0 ? dy / stepY : 0;
        var cells = Math.max(1, Math.max(cellsX, cellsY));
        var exponent = Math.max(0.1, this.fallDistanceExponent);
        var duration = this.fallTweenDuration * Math.pow(cells, exponent);
        duration = Math.max(Math.max(0, this.fallMinDuration), duration);
        if (this.fallMaxDuration > 0) {
            duration = Math.min(this.fallMaxDuration, duration);
        }
        return duration;
    };
    BoardView.prototype.collectSpawnRanks = function (board) {
        var oldMaxYByColumn = {};
        var newByColumn = {};
        for (var x = 0; x < board.width; x++) {
            oldMaxYByColumn[x] = -1;
        }
        for (var y = 0; y < board.height; y++) {
            for (var x = 0; x < board.width; x++) {
                var tile = board.get({ x: x, y: y });
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
        var ranks = {};
        var columns = Object.keys(newByColumn);
        for (var i = 0; i < columns.length; i++) {
            var column = parseInt(columns[i], 10);
            var columnTiles = newByColumn[column];
            var spawnedFromTop = [];
            for (var j = 0; j < columnTiles.length; j++) {
                if (columnTiles[j].y > oldMaxYByColumn[column]) {
                    spawnedFromTop.push(columnTiles[j]);
                }
            }
            spawnedFromTop.sort(function (a, b) {
                return a.y - b.y;
            });
            for (var rank = 0; rank < spawnedFromTop.length; rank++) {
                ranks[spawnedFromTop[rank].id] = rank;
            }
        }
        return ranks;
    };
    BoardView.prototype.resizeNodeToLevel = function () {
        var boardWidth = this.levelConfig.width * this.tileSize + (this.levelConfig.width - 1) * this.tileGapX;
        var boardHeight = this.levelConfig.height * this.tileSize + (this.levelConfig.height - 1) * this.tileGapY;
        var width = boardWidth + Math.max(0, this.paddingLeft) + Math.max(0, this.paddingRight);
        var height = boardHeight + Math.max(0, this.paddingTop) + Math.max(0, this.paddingBottom);
        this.node.setContentSize(width, height);
    };
    BoardView.prototype.clearSlots = function () {
        var keys = Object.keys(this.slots);
        for (var i = 0; i < keys.length; i++) {
            var slot = this.slots[keys[i]];
            if (slot && slot.isValid) {
                slot.off(cc.Node.EventType.TOUCH_END);
                slot.destroy();
            }
            delete this.slots[keys[i]];
        }
    };
    BoardView.prototype.clearTileNodes = function () {
        var ids = Object.keys(this.tileNodesById);
        for (var i = 0; i < ids.length; i++) {
            var id = parseInt(ids[i], 10);
            var node = this.tileNodesById[id];
            if (node && node.isValid) {
                cc.Tween.stopAllByTarget(node);
                node.destroy();
            }
            delete this.tileNodesById[id];
            delete this.prefabByTileId[id];
        }
    };
    BoardView.prototype.validatePrefabs = function (colors) {
        for (var i = 0; i < colors.length; i++) {
            if (!this.normalPrefab(colors[i])) {
                return false;
            }
        }
        if (!this.rocketHorizontalPrefab || !this.rocketVerticalPrefab || !this.bombPrefab) {
            return false;
        }
        return true;
    };
    BoardView.prototype.normalPrefab = function (color) {
        if (color === types_1.TileColor.Red) {
            return this.redTilePrefab;
        }
        if (color === types_1.TileColor.Blue) {
            return this.blueTilePrefab;
        }
        if (color === types_1.TileColor.Green) {
            return this.greenTilePrefab;
        }
        if (color === types_1.TileColor.Yellow) {
            return this.yellowTilePrefab;
        }
        if (color === types_1.TileColor.Purple) {
            return this.purpleTilePrefab;
        }
        return null;
    };
    BoardView.prototype.specialPrefab = function (special) {
        if (special === types_1.SpecialTileType.RocketHorizontal) {
            return this.rocketHorizontalPrefab;
        }
        if (special === types_1.SpecialTileType.RocketVertical) {
            return this.rocketVerticalPrefab;
        }
        return this.bombPrefab;
    };
    BoardView.prototype.key = function (position) {
        return position.x + ":" + position.y;
    };
    BoardView.prototype.getTileIdAt = function (position) {
        return this.tileIdByCell[this.key(position)];
    };
    BoardView.prototype.getTileNodeById = function (tileId) {
        return this.tileNodesById[tileId];
    };
    BoardView.prototype.replaceCellMap = function (nextTileIdByCell) {
        var cellKeys = Object.keys(this.tileIdByCell);
        for (var i = 0; i < cellKeys.length; i++) {
            delete this.tileIdByCell[cellKeys[i]];
        }
        var nextKeys = Object.keys(nextTileIdByCell);
        for (var j = 0; j < nextKeys.length; j++) {
            this.tileIdByCell[nextKeys[j]] = nextTileIdByCell[nextKeys[j]];
        }
    };
    BoardView.prototype.onDestroy = function () {
        this.clearSlots();
        this.clearTileNodes();
    };
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "redTilePrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "blueTilePrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "greenTilePrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "yellowTilePrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "purpleTilePrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "rocketHorizontalPrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "rocketVerticalPrefab", void 0);
    __decorate([
        property(cc.Prefab)
    ], BoardView.prototype, "bombPrefab", void 0);
    __decorate([
        property
    ], BoardView.prototype, "tileSize", void 0);
    __decorate([
        property
    ], BoardView.prototype, "tileGapX", void 0);
    __decorate([
        property
    ], BoardView.prototype, "tileGapY", void 0);
    __decorate([
        property
    ], BoardView.prototype, "paddingTop", void 0);
    __decorate([
        property
    ], BoardView.prototype, "paddingBottom", void 0);
    __decorate([
        property
    ], BoardView.prototype, "paddingLeft", void 0);
    __decorate([
        property
    ], BoardView.prototype, "paddingRight", void 0);
    __decorate([
        property
    ], BoardView.prototype, "fallTweenDuration", void 0);
    __decorate([
        property
    ], BoardView.prototype, "fallDistanceExponent", void 0);
    __decorate([
        property
    ], BoardView.prototype, "fallMinDuration", void 0);
    __decorate([
        property
    ], BoardView.prototype, "fallMaxDuration", void 0);
    __decorate([
        property
    ], BoardView.prototype, "fallTweenEasing", void 0);
    __decorate([
        property
    ], BoardView.prototype, "spawnOffsetY", void 0);
    __decorate([
        property
    ], BoardView.prototype, "lineBlastTileHideDuration", void 0);
    __decorate([
        property
    ], BoardView.prototype, "lineBlastTileHideEasing", void 0);
    __decorate([
        property
    ], BoardView.prototype, "bombImpactHideDuration", void 0);
    BoardView = __decorate([
        ccclass
    ], BoardView);
    return BoardView;
}(cc.Component));
exports.default = BoardView;

cc._RF.pop();