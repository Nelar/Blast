"use strict";
cc._RF.push(module, 'e2fffNVQepC1abffP8nf4Gm', 'RulesEngine');
// scripts/services/RulesEngine.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RulesEngine = void 0;
var types_1 = require("../models/types");
var RulesEngine = /** @class */ (function () {
    function RulesEngine(groupFinder, gravityResolver, spawnResolver, shuffleService, specialTileFactory) {
        this.groupFinder = groupFinder;
        this.gravityResolver = gravityResolver;
        this.spawnResolver = spawnResolver;
        this.shuffleService = shuffleService;
        this.specialTileFactory = specialTileFactory;
    }
    RulesEngine.prototype.createInitial = function (board, config, random) {
        this.spawnResolver.fill(board, config.colors, random);
    };
    RulesEngine.prototype.processTap = function (board, position, config) {
        var clickedTile = board.get(position);
        if (!clickedTile) {
            return this.invalid();
        }
        if (clickedTile.special !== types_1.SpecialTileType.None) {
            return this.resolveSpecialTap(board, position, config);
        }
        var group = this.groupFinder.findGroup(board, position, config.minGroupSize);
        if (group.length === 0) {
            return this.invalid();
        }
        var special = this.specialTileFactory.decideSpecial(group, position, config.superTileLineRequirement);
        var removedKeys = {};
        for (var i = 0; i < group.length; i++) {
            var key = this.key(group[i]);
            removedKeys[key] = group[i];
        }
        if (special !== types_1.SpecialTileType.None) {
            delete removedKeys[this.key(position)];
        }
        var finalRemoved = this.expandWithSpecials(board, this.toArray(removedKeys), config.tileBombRadius);
        var hasSpecial = false;
        for (var j = 0; j < finalRemoved.length; j++) {
            var removedTile = board.get(finalRemoved[j]);
            if (removedTile && removedTile.special !== types_1.SpecialTileType.None) {
                hasSpecial = true;
            }
            board.set(finalRemoved[j], null);
        }
        if (special !== types_1.SpecialTileType.None) {
            board.set(position, board.createTile(clickedTile.color, special));
        }
        this.gravityResolver.apply(board);
        this.spawnResolver.fill(board, config.colors, Math.random);
        var score = finalRemoved.length * config.scorePerTile;
        if (hasSpecial) {
            score = score * config.scoreSpecialMultiplier;
        }
        return {
            isValid: true,
            consumedMove: true,
            removed: finalRemoved,
            scoreDelta: score,
            spawnedSpecial: special === types_1.SpecialTileType.None ? null : { position: position, special: special },
        };
    };
    RulesEngine.prototype.applyBombBooster = function (board, position, config) {
        var targets = this.positionsInRadius(board, position, config.boosterBombRadius);
        var removed = this.expandWithSpecials(board, targets, config.tileBombRadius);
        if (removed.length === 0) {
            return this.invalid();
        }
        for (var i = 0; i < removed.length; i++) {
            board.set(removed[i], null);
        }
        this.gravityResolver.apply(board);
        this.spawnResolver.fill(board, config.colors, Math.random);
        var score = removed.length * config.scorePerTile * config.scoreSpecialMultiplier;
        return {
            isValid: true,
            consumedMove: false,
            removed: removed,
            scoreDelta: score,
            spawnedSpecial: null,
        };
    };
    RulesEngine.prototype.applyTeleport = function (board, first, second) {
        if (!board.inBounds(first) || !board.inBounds(second)) {
            return false;
        }
        var firstTile = board.get(first);
        var secondTile = board.get(second);
        if (!firstTile || !secondTile) {
            return false;
        }
        board.swap(first, second);
        return true;
    };
    RulesEngine.prototype.ensureHasMoves = function (board, config, maxShufflesLeft, random) {
        var used = 0;
        while (!this.groupFinder.hasAnyGroup(board, config.minGroupSize) && used < maxShufflesLeft) {
            this.shuffleService.shuffle(board, random);
            used++;
        }
        return {
            shuffled: used > 0,
            usedShuffles: used,
        };
    };
    RulesEngine.prototype.hasAnyMoves = function (board, config) {
        return this.groupFinder.hasAnyGroup(board, config.minGroupSize);
    };
    RulesEngine.prototype.invalid = function () {
        return {
            isValid: false,
            consumedMove: false,
            removed: [],
            scoreDelta: 0,
            spawnedSpecial: null,
        };
    };
    RulesEngine.prototype.resolveSpecialTap = function (board, position, config) {
        var tile = board.get(position);
        if (!tile) {
            return this.invalid();
        }
        var targets = this.expandWithSpecials(board, [position], config.tileBombRadius);
        for (var i = 0; i < targets.length; i++) {
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
    };
    RulesEngine.prototype.expandWithSpecials = function (board, seed, bombRadius) {
        var queue = seed.slice();
        var removed = {};
        while (queue.length > 0) {
            var current = queue.shift();
            if (!board.inBounds(current)) {
                continue;
            }
            var currentKey = this.key(current);
            if (removed[currentKey]) {
                continue;
            }
            var tile = board.get(current);
            if (!tile) {
                continue;
            }
            removed[currentKey] = current;
            var extra = this.specialTargets(board, current, tile.special, bombRadius);
            for (var i = 0; i < extra.length; i++) {
                var extraKey = this.key(extra[i]);
                if (!removed[extraKey]) {
                    queue.push(extra[i]);
                }
            }
        }
        return this.toArray(removed);
    };
    RulesEngine.prototype.specialTargets = function (board, position, special, bombRadius) {
        if (special === types_1.SpecialTileType.None) {
            return [];
        }
        if (special === types_1.SpecialTileType.RocketHorizontal) {
            var row = [];
            for (var x = 0; x < board.width; x++) {
                row.push({ x: x, y: position.y });
            }
            return row;
        }
        if (special === types_1.SpecialTileType.RocketVertical) {
            var column = [];
            for (var y = 0; y < board.height; y++) {
                column.push({ x: position.x, y: y });
            }
            return column;
        }
        if (special === types_1.SpecialTileType.Bomb) {
            return this.positionsInRadius(board, position, bombRadius);
        }
        return [];
    };
    RulesEngine.prototype.positionsInRadius = function (board, center, radius) {
        var result = [];
        for (var y = center.y - radius; y <= center.y + radius; y++) {
            for (var x = center.x - radius; x <= center.x + radius; x++) {
                var p = { x: x, y: y };
                if (board.inBounds(p)) {
                    result.push(p);
                }
            }
        }
        return result;
    };
    RulesEngine.prototype.key = function (position) {
        return position.x + ":" + position.y;
    };
    RulesEngine.prototype.toArray = function (record) {
        var arr = [];
        var keys = Object.keys(record);
        for (var i = 0; i < keys.length; i++) {
            arr.push(record[keys[i]]);
        }
        return arr;
    };
    return RulesEngine;
}());
exports.RulesEngine = RulesEngine;

cc._RF.pop();