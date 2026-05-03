"use strict";
cc._RF.push(module, '9e626aa+XlGpbaEjqsLwZ8N', 'ShuffleService');
// scripts/services/ShuffleService.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShuffleService = void 0;
var ShuffleService = /** @class */ (function () {
    function ShuffleService() {
    }
    ShuffleService.prototype.shuffle = function (board, random) {
        var positions = [];
        var tiles = [];
        for (var y = 0; y < board.height; y++) {
            for (var x = 0; x < board.width; x++) {
                var pos = { x: x, y: y };
                var tile = board.get(pos);
                if (tile) {
                    positions.push(pos);
                    tiles.push(tile);
                }
            }
        }
        for (var i = tiles.length - 1; i > 0; i--) {
            var j = Math.floor(random() * (i + 1));
            var current = tiles[i];
            tiles[i] = tiles[j];
            tiles[j] = current;
        }
        for (var k = 0; k < positions.length; k++) {
            board.set(positions[k], tiles[k]);
        }
    };
    return ShuffleService;
}());
exports.ShuffleService = ShuffleService;

cc._RF.pop();