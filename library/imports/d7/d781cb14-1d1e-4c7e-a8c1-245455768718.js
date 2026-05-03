"use strict";
cc._RF.push(module, 'd781csUHR5MfqjBJFRVdocY', 'GroupFinder');
// scripts/services/GroupFinder.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupFinder = void 0;
var GroupFinder = /** @class */ (function () {
    function GroupFinder() {
        this.directions = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 },
        ];
    }
    GroupFinder.prototype.findGroup = function (board, start, minSize) {
        var startTile = board.get(start);
        if (!startTile) {
            return [];
        }
        var queue = [start];
        var visited = {};
        var result = [];
        while (queue.length > 0) {
            var current = queue.shift();
            var key = current.x + ":" + current.y;
            if (visited[key]) {
                continue;
            }
            visited[key] = true;
            var tile = board.get(current);
            if (!tile || tile.color !== startTile.color) {
                continue;
            }
            result.push(current);
            for (var i = 0; i < this.directions.length; i++) {
                var next = {
                    x: current.x + this.directions[i].x,
                    y: current.y + this.directions[i].y,
                };
                if (board.inBounds(next)) {
                    queue.push(next);
                }
            }
        }
        if (result.length < minSize) {
            return [];
        }
        return result;
    };
    GroupFinder.prototype.hasAnyGroup = function (board, minSize) {
        for (var y = 0; y < board.height; y++) {
            for (var x = 0; x < board.width; x++) {
                var group = this.findGroup(board, { x: x, y: y }, minSize);
                if (group.length > 0) {
                    return true;
                }
            }
        }
        return false;
    };
    return GroupFinder;
}());
exports.GroupFinder = GroupFinder;

cc._RF.pop();