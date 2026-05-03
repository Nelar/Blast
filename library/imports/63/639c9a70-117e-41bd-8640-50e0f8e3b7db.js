"use strict";
cc._RF.push(module, '639c9pwEX5BvYZAUOD447fb', 'types');
// scripts/models/types.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoosterType = exports.SpecialTileType = exports.TileColor = void 0;
var TileColor;
(function (TileColor) {
    TileColor["Red"] = "red";
    TileColor["Blue"] = "blue";
    TileColor["Green"] = "green";
    TileColor["Yellow"] = "yellow";
    TileColor["Purple"] = "purple";
})(TileColor = exports.TileColor || (exports.TileColor = {}));
var SpecialTileType;
(function (SpecialTileType) {
    SpecialTileType["None"] = "none";
    SpecialTileType["RocketHorizontal"] = "rocket_horizontal";
    SpecialTileType["RocketVertical"] = "rocket_vertical";
    SpecialTileType["Bomb"] = "bomb";
})(SpecialTileType = exports.SpecialTileType || (exports.SpecialTileType = {}));
var BoosterType;
(function (BoosterType) {
    BoosterType["None"] = "none";
    BoosterType["Bomb"] = "bomb";
    BoosterType["Teleport"] = "teleport";
})(BoosterType = exports.BoosterType || (exports.BoosterType = {}));

cc._RF.pop();