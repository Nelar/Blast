"use strict";
cc._RF.push(module, '1dac6+CmipPRLbv2WZ46Kv/', 'HudPresenter');
// scripts/ui/HudPresenter.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var HudPresenter = /** @class */ (function (_super) {
    __extends(HudPresenter, _super);
    function HudPresenter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.movesLabel = null;
        _this.scoreLabel = null;
        _this.bombCountLabel = null;
        _this.teleportCountLabel = null;
        _this.slotBombNode = null;
        _this.slotTeleportNode = null;
        _this.winPanel = null;
        _this.losePanel = null;
        _this.scoreAnimDuration = 0.35;
        _this.scoreAnimPower = 2;
        _this.scoreInitialized = false;
        _this.displayedScore = 0;
        _this.scoreFrom = 0;
        _this.scoreTo = 0;
        _this.scoreAnimElapsed = 0;
        _this.scoreAnimActive = false;
        _this.lastTargetScore = 0;
        return _this;
    }
    HudPresenter.prototype.isConfigured = function () {
        return !!(this.movesLabel &&
            this.scoreLabel &&
            this.bombCountLabel &&
            this.teleportCountLabel &&
            this.slotBombNode &&
            this.slotTeleportNode &&
            this.winPanel &&
            this.losePanel);
    };
    HudPresenter.prototype.getSlotBombNode = function () {
        return this.slotBombNode;
    };
    HudPresenter.prototype.getSlotTeleportNode = function () {
        return this.slotTeleportNode;
    };
    HudPresenter.prototype.bindSlotClicks = function (onBombTap, onTeleportTap, target) {
        if (this.slotBombNode && this.slotBombNode.isValid) {
            this.slotBombNode.on(cc.Node.EventType.TOUCH_END, onBombTap, target);
        }
        if (this.slotTeleportNode && this.slotTeleportNode.isValid) {
            this.slotTeleportNode.on(cc.Node.EventType.TOUCH_END, onTeleportTap, target);
        }
    };
    HudPresenter.prototype.unbindSlotClicks = function (onBombTap, onTeleportTap, target) {
        if (this.slotBombNode && this.slotBombNode.isValid) {
            this.slotBombNode.off(cc.Node.EventType.TOUCH_END, onBombTap, target);
        }
        if (this.slotTeleportNode && this.slotTeleportNode.isValid) {
            this.slotTeleportNode.off(cc.Node.EventType.TOUCH_END, onTeleportTap, target);
        }
    };
    HudPresenter.prototype.render = function (gameState, boosterState) {
        this.movesLabel.string = String(gameState.movesLeft);
        this.lastTargetScore = gameState.targetScore;
        this.updateScore(gameState.score, gameState.targetScore);
        this.bombCountLabel.string = String(boosterState.bombCount);
        this.teleportCountLabel.string = String(boosterState.teleportCount);
        this.slotBombNode.opacity = boosterState.active === types_1.BoosterType.Bomb ? 180 : 255;
        this.slotTeleportNode.opacity = boosterState.active === types_1.BoosterType.Teleport ? 180 : 255;
    };
    HudPresenter.prototype.showFinish = function (gameState) {
        if (gameState.isWin) {
            this.winPanel.active = true;
            return;
        }
        if (gameState.isLose) {
            this.losePanel.active = true;
        }
    };
    HudPresenter.prototype.restart = function () {
        var scene = cc.director.getScene();
        if (!scene || !scene.name) {
            return;
        }
        cc.director.loadScene(scene.name);
    };
    HudPresenter.prototype.update = function (dt) {
        if (!this.scoreAnimActive) {
            return;
        }
        var duration = Math.max(0.001, this.scoreAnimDuration);
        this.scoreAnimElapsed += dt;
        var t = this.scoreAnimElapsed / duration;
        if (t >= 1) {
            t = 1;
            this.scoreAnimActive = false;
        }
        var power = Math.max(1, this.scoreAnimPower);
        var eased = Math.pow(t, power);
        var value = this.scoreFrom + (this.scoreTo - this.scoreFrom) * eased;
        this.displayedScore = value;
        this.syncScoreLabel(this.displayedScore, this.lastTargetScore);
    };
    HudPresenter.prototype.updateScore = function (score, targetScore) {
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
    };
    HudPresenter.prototype.syncScoreLabel = function (score, targetScore) {
        this.scoreLabel.string = Math.round(score) + "/" + targetScore;
    };
    __decorate([
        property(cc.Label)
    ], HudPresenter.prototype, "movesLabel", void 0);
    __decorate([
        property(cc.Label)
    ], HudPresenter.prototype, "scoreLabel", void 0);
    __decorate([
        property(cc.Label)
    ], HudPresenter.prototype, "bombCountLabel", void 0);
    __decorate([
        property(cc.Label)
    ], HudPresenter.prototype, "teleportCountLabel", void 0);
    __decorate([
        property(cc.Node)
    ], HudPresenter.prototype, "slotBombNode", void 0);
    __decorate([
        property(cc.Node)
    ], HudPresenter.prototype, "slotTeleportNode", void 0);
    __decorate([
        property(cc.Node)
    ], HudPresenter.prototype, "winPanel", void 0);
    __decorate([
        property(cc.Node)
    ], HudPresenter.prototype, "losePanel", void 0);
    __decorate([
        property
    ], HudPresenter.prototype, "scoreAnimDuration", void 0);
    __decorate([
        property
    ], HudPresenter.prototype, "scoreAnimPower", void 0);
    HudPresenter = __decorate([
        ccclass
    ], HudPresenter);
    return HudPresenter;
}(cc.Component));
exports.default = HudPresenter;

cc._RF.pop();