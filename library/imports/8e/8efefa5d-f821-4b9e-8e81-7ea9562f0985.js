"use strict";
cc._RF.push(module, '8efefpd+CFLno6BfqlWLwmF', 'SpecialTileFactory');
// scripts/services/SpecialTileFactory.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialTileFactory = void 0;
var types_1 = require("../models/types");
var SpecialTileFactory = /** @class */ (function () {
    function SpecialTileFactory() {
    }
    SpecialTileFactory.prototype.decideSpecial = function (group, clicked, superTileLineRequirement) {
        if (group.length < superTileLineRequirement) {
            return types_1.SpecialTileType.None;
        }
        var horizontal = 0;
        var vertical = 0;
        for (var i = 0; i < group.length; i++) {
            if (group[i].y === clicked.y) {
                horizontal++;
            }
            if (group[i].x === clicked.x) {
                vertical++;
            }
        }
        if (horizontal >= superTileLineRequirement && vertical >= superTileLineRequirement) {
            return types_1.SpecialTileType.Bomb;
        }
        if (horizontal >= superTileLineRequirement) {
            return types_1.SpecialTileType.RocketHorizontal;
        }
        if (vertical >= superTileLineRequirement) {
            return types_1.SpecialTileType.RocketVertical;
        }
        return types_1.SpecialTileType.None;
    };
    return SpecialTileFactory;
}());
exports.SpecialTileFactory = SpecialTileFactory;

cc._RF.pop();