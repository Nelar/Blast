"use strict";
cc._RF.push(module, '1059elRjN9GXpPA9bhO9ZiW', 'GameController');
// scripts/controllers/GameController.ts

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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var BoardModel_1 = require("../models/BoardModel");
var types_1 = require("../models/types");
var BoosterService_1 = require("../services/BoosterService");
var GravityResolver_1 = require("../services/GravityResolver");
var GroupFinder_1 = require("../services/GroupFinder");
var RulesEngine_1 = require("../services/RulesEngine");
var ShuffleService_1 = require("../services/ShuffleService");
var SpawnResolver_1 = require("../services/SpawnResolver");
var SpecialTileFactory_1 = require("../services/SpecialTileFactory");
var BoardView_1 = require("../ui/BoardView");
var HudPresenter_1 = require("../ui/HudPresenter");
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var GameController = /** @class */ (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.levelConfigAsset = null;
        _this.boardView = null;
        _this.hudPresenter = null;
        _this.levelConfig = null;
        _this.board = null;
        _this.rules = null;
        _this.boosterService = null;
        _this.gameState = null;
        _this.loadingDone = false;
        _this.moveAnimationInProgress = false;
        return _this;
    }
    GameController.prototype.onLoad = function () {
        if (!this.levelConfigAsset) {
            cc.error("Level config asset is not assigned");
            return;
        }
        this.levelConfig = this.levelConfigAsset.json;
        this.initializeGame();
    };
    GameController.prototype.initializeGame = function () {
        var _this = this;
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
        this.rules = new RulesEngine_1.RulesEngine(new GroupFinder_1.GroupFinder(), new GravityResolver_1.GravityResolver(), new SpawnResolver_1.SpawnResolver(), new ShuffleService_1.ShuffleService(), new SpecialTileFactory_1.SpecialTileFactory());
        this.boosterService = new BoosterService_1.BoosterService(this.levelConfig.boosterBombCount, this.levelConfig.boosterTeleportCount);
        this.board = new BoardModel_1.BoardModel(this.levelConfig.width, this.levelConfig.height);
        this.rules.createInitial(this.board, this.levelConfig, Math.random);
        this.gameState = {
            score: 0,
            targetScore: this.levelConfig.targetScore,
            movesLeft: this.levelConfig.startMoves,
            shufflesLeft: this.levelConfig.maxShuffles,
            isWin: false,
            isLose: false,
        };
        if (!this.boardView.configure(this.levelConfig, function (position) { return _this.handleFieldTap(position); })) {
            cc.error("BoardView is not configured");
            return;
        }
        this.hudPresenter.bindSlotClicks(this.handleBombToggle, this.handleTeleportToggle, this);
        this.ensureMovesOrLose();
        this.render();
        this.loadingDone = true;
    };
    GameController.prototype.onDestroy = function () {
        if (!this.hudPresenter) {
            return;
        }
        this.hudPresenter.unbindSlotClicks(this.handleBombToggle, this.handleTeleportToggle, this);
    };
    GameController.prototype.handleBombToggle = function () {
        if (this.isInteractionBlocked()) {
            return;
        }
        this.boosterService.activate(types_1.BoosterType.Bomb);
        this.renderHud();
    };
    GameController.prototype.handleTeleportToggle = function () {
        if (this.isInteractionBlocked()) {
            return;
        }
        this.boosterService.activate(types_1.BoosterType.Teleport);
        this.renderHud();
    };
    GameController.prototype.handleFieldTap = function (position) {
        return __awaiter(this, void 0, Promise, function () {
            var boosterState, bombResult, clickedTile, result, clickedWasSpecial, destroyTargets_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isInteractionBlocked()) {
                            return [2 /*return*/];
                        }
                        boosterState = this.boosterService.getState();
                        if (!(boosterState.active === types_1.BoosterType.Bomb)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.runLocked(function () { return _this.boardView.playBoosterBombEffect(position, _this.levelConfig.boosterBombRadius); })];
                    case 1:
                        _a.sent();
                        if (!this.boosterService.consumeBomb()) {
                            return [2 /*return*/];
                        }
                        bombResult = this.rules.applyBombBooster(this.board, position, this.levelConfig);
                        if (bombResult.isValid) {
                            this.applyMoveResult(false, bombResult.scoreDelta);
                        }
                        this.render();
                        return [2 /*return*/];
                    case 2:
                        if (boosterState.active === types_1.BoosterType.Teleport) {
                            this.handleTeleport(position, boosterState);
                            return [2 /*return*/];
                        }
                        clickedTile = this.board.get(position);
                        result = this.rules.processTap(this.board, position, this.levelConfig);
                        if (!!result.isValid) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.runLocked(function () { return _this.boardView.playMissClickAnimation(position); })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4:
                        clickedWasSpecial = !!clickedTile && clickedTile.special !== types_1.SpecialTileType.None;
                        if (!(clickedWasSpecial && clickedTile)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.runLocked(function () { return _this.boardView.playSpecialActivationEffect(position, clickedTile.special); })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(!clickedWasSpecial && result.removed.length > 0)) return [3 /*break*/, 8];
                        destroyTargets_1 = result.removed.slice();
                        if (result.spawnedSpecial) {
                            destroyTargets_1.push(result.spawnedSpecial.position);
                        }
                        return [4 /*yield*/, this.runLocked(function () { return _this.boardView.playDestroyAnimation(destroyTargets_1); })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        this.boardView.setSpecialSpawnHint(result.spawnedSpecial ? result.spawnedSpecial.position : null);
                        this.applyMoveResult(result.consumedMove, result.scoreDelta);
                        this.render();
                        return [2 /*return*/];
                }
            });
        });
    };
    GameController.prototype.handleTeleport = function (position, boosterState) {
        if (!boosterState.teleportFirstPick) {
            this.boosterService.setTeleportFirstPick(position);
            this.renderHud();
            return;
        }
        var success = this.rules.applyTeleport(this.board, boosterState.teleportFirstPick, position);
        if (!success) {
            this.boosterService.clearActive();
            this.renderHud();
            return;
        }
        var consumed = this.boosterService.consumeTeleport();
        if (!consumed) {
            return;
        }
        this.applyMoveResult(false, 0);
        this.render();
    };
    GameController.prototype.applyMoveResult = function (consumedMove, scoreDelta) {
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
    };
    GameController.prototype.ensureMovesOrLose = function () {
        if (this.rules.hasAnyMoves(this.board, this.levelConfig)) {
            return;
        }
        var outcome = this.rules.ensureHasMoves(this.board, this.levelConfig, this.gameState.shufflesLeft, Math.random);
        this.gameState.shufflesLeft -= outcome.usedShuffles;
        if (!this.rules.hasAnyMoves(this.board, this.levelConfig) && this.gameState.shufflesLeft <= 0) {
            this.gameState.isLose = true;
        }
    };
    GameController.prototype.render = function () {
        this.boardView.renderBoard(this.board);
        this.renderHud();
    };
    GameController.prototype.renderHud = function () {
        this.hudPresenter.render(this.gameState, this.boosterService.getState());
        this.hudPresenter.showFinish(this.gameState);
    };
    GameController.prototype.isInteractionBlocked = function () {
        return !this.loadingDone || this.moveAnimationInProgress || this.gameState.isWin || this.gameState.isLose;
    };
    GameController.prototype.runLocked = function (action) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.moveAnimationInProgress = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, action()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.moveAnimationInProgress = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        property(cc.JsonAsset)
    ], GameController.prototype, "levelConfigAsset", void 0);
    __decorate([
        property(BoardView_1.default)
    ], GameController.prototype, "boardView", void 0);
    __decorate([
        property(HudPresenter_1.default)
    ], GameController.prototype, "hudPresenter", void 0);
    GameController = __decorate([
        ccclass
    ], GameController);
    return GameController;
}(cc.Component));
exports.default = GameController;

cc._RF.pop();