"use strict";
cc._RF.push(module, '5a16adEtFRIgaW/oxjySeJJ', 'SpawnResolver');
// scripts/services/SpawnResolver.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpawnResolver = void 0;
var types_1 = require("../models/types");
var SpawnResolver = /** @class */ (function () {
    function SpawnResolver() {
    }
    SpawnResolver.prototype.fill = function (board, colors, random) {
        for (var y = 0; y < board.height; y++) {
            for (var x = 0; x < board.width; x++) {
                var position = { x: x, y: y };
                if (!board.get(position)) {
                    var index = Math.floor(random() * colors.length);
                    var color = colors[index];
                    board.set(position, board.createTile(color, types_1.SpecialTileType.None));
                }
            }
        }
    };
    return SpawnResolver;
}());
exports.SpawnResolver = SpawnResolver;

cc._RF.pop();