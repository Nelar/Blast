"use strict";
cc._RF.push(module, 'dbc87jEZwJFHYjX4q7LCN4l', 'TileView');
// scripts/ui/TileView.ts

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
var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
var TileView = /** @class */ (function (_super) {
    __extends(TileView, _super);
    function TileView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.destroyTweenDuration = 0.3;
        _this.destroyTweenScaleUp = 1.1;
        _this.destroyScaleUpEasing = "sineOut";
        _this.destroyScaleDownEasing = "sineIn";
        _this.missClickDuration = 0.3;
        _this.missClickScaleUp = 1.1;
        _this.missClickScaleUpEasing = "sineOut";
        _this.missClickScaleDownEasing = "sineIn";
        _this.rocketFlyDuration = 0.3;
        _this.rocketFlyEasing = "sineOut";
        _this.bombBlastExpandDuration = 0.15;
        _this.bombBlastHoldDuration = 0.1;
        _this.bombBlastCollapseDuration = 0.15;
        _this.bombBlastExpandEasing = "sineOut";
        _this.bombBlastCollapseEasing = "sineIn";
        _this.effectZIndex = 1000;
        _this.rocketLeftNode = null;
        _this.rocketRightNode = null;
        _this.rocketUpNode = null;
        _this.rocketDownNode = null;
        return _this;
    }
    TileView.prototype.playDestroyAnimation = function () {
        var duration = Math.max(0.01, this.destroyTweenDuration);
        var upDuration = duration * 0.35;
        var downDuration = duration * 0.65;
        return this.playScaleTween(this.node, this.destroyTweenScaleUp, 0, upDuration, downDuration, this.destroyScaleUpEasing, this.destroyScaleDownEasing);
    };
    TileView.prototype.playMissClickAnimation = function () {
        var duration = Math.max(0.01, this.missClickDuration);
        var upDuration = duration * 0.45;
        var downDuration = duration * 0.55;
        return this.playScaleTween(this.node, this.missClickScaleUp, 1, upDuration, downDuration, this.missClickScaleUpEasing, this.missClickScaleDownEasing);
    };
    TileView.prototype.playLineBlastEffect = function (isHorizontal, negativeDistance, positiveDistance) {
        var _this = this;
        var negativeRocket = isHorizontal ? this.rocketLeftNode : this.rocketDownNode;
        var positiveRocket = isHorizontal ? this.rocketRightNode : this.rocketUpNode;
        var rocketsCount = (negativeRocket ? 1 : 0) + (positiveRocket ? 1 : 0);
        if (rocketsCount === 0) {
            return Promise.resolve();
        }
        var rootSprite = this.getComponent(cc.Sprite);
        if (rootSprite) {
            rootSprite.enabled = false;
        }
        var duration = Math.max(0.01, this.rocketFlyDuration);
        return new Promise(function (resolve) {
            _this.node.zIndex = _this.effectZIndex;
            var tasks = [];
            if (negativeRocket && negativeRocket.isValid) {
                negativeRocket.active = true;
                negativeRocket.zIndex = _this.effectZIndex + 1;
            }
            tasks.push(_this.flyRocket(negativeRocket, isHorizontal, -negativeDistance, duration));
            if (positiveRocket && positiveRocket.isValid) {
                positiveRocket.active = true;
                positiveRocket.zIndex = _this.effectZIndex + 1;
            }
            tasks.push(_this.flyRocket(positiveRocket, isHorizontal, positiveDistance, duration));
            Promise.all(tasks).then(function () {
                resolve();
            });
        });
    };
    TileView.prototype.flyRocket = function (rocket, isHorizontal, offset, duration) {
        var _this = this;
        if (!rocket || !rocket.isValid) {
            return Promise.resolve();
        }
        var start = rocket.position.clone();
        var target = isHorizontal
            ? cc.v3(start.x + offset, start.y, start.z)
            : cc.v3(start.x, start.y + offset, start.z);
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(rocket);
            cc.tween(rocket)
                .to(duration, { position: target }, { easing: _this.rocketFlyEasing || "sineOut" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    TileView.prototype.playBombBlastEffect = function (radius, stepX, stepY, onImpact) {
        var _this = this;
        var rootSprite = this.getComponent(cc.Sprite);
        if (rootSprite) {
            rootSprite.enabled = true;
        }
        var baseWidth = Math.max(1, this.node.width);
        var baseHeight = Math.max(1, this.node.height);
        var safeStepX = Math.max(1, stepX);
        var safeStepY = Math.max(1, stepY);
        var diameter = Math.max(1, radius * 2 + 1);
        var targetScaleX = (diameter * safeStepX) / baseWidth;
        var targetScaleY = (diameter * safeStepY) / baseHeight;
        var expandDuration = Math.max(0.01, this.bombBlastExpandDuration);
        var holdDuration = Math.max(0, this.bombBlastHoldDuration);
        var collapseDuration = Math.max(0.01, this.bombBlastCollapseDuration);
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(_this.node);
            _this.node.zIndex = _this.effectZIndex;
            _this.node.setScale(1, 1);
            cc.tween(_this.node)
                .to(expandDuration, { scaleX: targetScaleX, scaleY: targetScaleY }, { easing: _this.bombBlastExpandEasing || "sineOut" })
                .call(function () {
                if (onImpact) {
                    onImpact();
                }
            })
                .delay(holdDuration)
                .to(collapseDuration, { scaleX: 0, scaleY: 0 }, { easing: _this.bombBlastCollapseEasing || "sineIn" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    TileView.prototype.playScaleTween = function (target, upScale, downScale, upDuration, downDuration, upEasing, downEasing) {
        return new Promise(function (resolve) {
            cc.Tween.stopAllByTarget(target);
            target.setScale(1, 1);
            cc.tween(target)
                .to(upDuration, { scale: upScale }, { easing: upEasing || "sineOut" })
                .to(downDuration, { scale: downScale }, { easing: downEasing || "sineIn" })
                .call(function () {
                resolve();
            })
                .start();
        });
    };
    __decorate([
        property
    ], TileView.prototype, "destroyTweenDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "destroyTweenScaleUp", void 0);
    __decorate([
        property
    ], TileView.prototype, "destroyScaleUpEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "destroyScaleDownEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "missClickDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "missClickScaleUp", void 0);
    __decorate([
        property
    ], TileView.prototype, "missClickScaleUpEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "missClickScaleDownEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "rocketFlyDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "rocketFlyEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "bombBlastExpandDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "bombBlastHoldDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "bombBlastCollapseDuration", void 0);
    __decorate([
        property
    ], TileView.prototype, "bombBlastExpandEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "bombBlastCollapseEasing", void 0);
    __decorate([
        property
    ], TileView.prototype, "effectZIndex", void 0);
    __decorate([
        property(cc.Node)
    ], TileView.prototype, "rocketLeftNode", void 0);
    __decorate([
        property(cc.Node)
    ], TileView.prototype, "rocketRightNode", void 0);
    __decorate([
        property(cc.Node)
    ], TileView.prototype, "rocketUpNode", void 0);
    __decorate([
        property(cc.Node)
    ], TileView.prototype, "rocketDownNode", void 0);
    TileView = __decorate([
        ccclass
    ], TileView);
    return TileView;
}(cc.Component));
exports.default = TileView;

cc._RF.pop();