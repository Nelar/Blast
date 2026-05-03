"use strict";
cc._RF.push(module, 'ece79HHaohKmagYYo+07oXC', 'BoosterService');
// scripts/services/BoosterService.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoosterService = void 0;
var types_1 = require("../models/types");
var BoosterService = /** @class */ (function () {
    function BoosterService(bombCount, teleportCount) {
        this.state = {
            active: types_1.BoosterType.None,
            bombCount: bombCount,
            teleportCount: teleportCount,
            teleportFirstPick: null,
        };
    }
    BoosterService.prototype.getState = function () {
        return {
            active: this.state.active,
            bombCount: this.state.bombCount,
            teleportCount: this.state.teleportCount,
            teleportFirstPick: this.state.teleportFirstPick ? { x: this.state.teleportFirstPick.x, y: this.state.teleportFirstPick.y } : null,
        };
    };
    BoosterService.prototype.activate = function (type) {
        if (type === types_1.BoosterType.Bomb && this.state.bombCount <= 0) {
            return false;
        }
        if (type === types_1.BoosterType.Teleport && this.state.teleportCount <= 0) {
            return false;
        }
        this.state.active = type;
        this.state.teleportFirstPick = null;
        return true;
    };
    BoosterService.prototype.clearActive = function () {
        this.state.active = types_1.BoosterType.None;
        this.state.teleportFirstPick = null;
    };
    BoosterService.prototype.consumeBomb = function () {
        if (this.state.bombCount <= 0) {
            return false;
        }
        this.state.bombCount--;
        this.clearActive();
        return true;
    };
    BoosterService.prototype.setTeleportFirstPick = function (position) {
        this.state.teleportFirstPick = position;
    };
    BoosterService.prototype.consumeTeleport = function () {
        if (this.state.teleportCount <= 0) {
            return false;
        }
        this.state.teleportCount--;
        this.clearActive();
        return true;
    };
    return BoosterService;
}());
exports.BoosterService = BoosterService;

cc._RF.pop();