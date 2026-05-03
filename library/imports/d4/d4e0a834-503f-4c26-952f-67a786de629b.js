"use strict";
cc._RF.push(module, 'd4e0ag0UD9MJpUvZ6eG3mKb', 'GravityResolver');
// scripts/services/GravityResolver.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GravityResolver = void 0;
var GravityResolver = /** @class */ (function () {
    function GravityResolver() {
    }
    GravityResolver.prototype.apply = function (board) {
        for (var x = 0; x < board.width; x++) {
            var writeY = 0;
            for (var y = 0; y < board.height; y++) {
                var tile = board.get({ x: x, y: y });
                if (tile) {
                    if (writeY !== y) {
                        board.set({ x: x, y: writeY }, tile);
                        board.set({ x: x, y: y }, null);
                    }
                    writeY++;
                }
            }
            for (var clearY = writeY; clearY < board.height; clearY++) {
                board.set({ x: x, y: clearY }, null);
            }
        }
    };
    return GravityResolver;
}());
exports.GravityResolver = GravityResolver;

cc._RF.pop();