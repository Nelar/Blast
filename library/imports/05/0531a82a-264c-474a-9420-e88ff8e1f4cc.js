"use strict";
cc._RF.push(module, '0531agqJkxHSpQg6I/44fTM', 'BoardModel');
// scripts/models/BoardModel.ts

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoardModel = void 0;
var BoardModel = /** @class */ (function () {
    function BoardModel(width, height) {
        this.nextId = 1;
        this.widthValue = width;
        this.heightValue = height;
        this.cells = [];
        for (var y = 0; y < height; y++) {
            var row = [];
            for (var x = 0; x < width; x++) {
                row.push(null);
            }
            this.cells.push(row);
        }
    }
    Object.defineProperty(BoardModel.prototype, "width", {
        get: function () {
            return this.widthValue;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BoardModel.prototype, "height", {
        get: function () {
            return this.heightValue;
        },
        enumerable: false,
        configurable: true
    });
    BoardModel.prototype.inBounds = function (position) {
        return position.x >= 0 && position.x < this.widthValue && position.y >= 0 && position.y < this.heightValue;
    };
    BoardModel.prototype.get = function (position) {
        if (!this.inBounds(position)) {
            return null;
        }
        return this.cells[position.y][position.x];
    };
    BoardModel.prototype.set = function (position, tile) {
        if (!this.inBounds(position)) {
            return;
        }
        this.cells[position.y][position.x] = tile;
    };
    BoardModel.prototype.swap = function (a, b) {
        if (!this.inBounds(a) || !this.inBounds(b)) {
            return;
        }
        var first = this.cells[a.y][a.x];
        this.cells[a.y][a.x] = this.cells[b.y][b.x];
        this.cells[b.y][b.x] = first;
    };
    BoardModel.prototype.createTile = function (color, special) {
        var tile = {
            id: this.nextId,
            color: color,
            special: special,
        };
        this.nextId++;
        return tile;
    };
    BoardModel.prototype.forEachCell = function (handler) {
        for (var y = 0; y < this.heightValue; y++) {
            for (var x = 0; x < this.widthValue; x++) {
                handler({ x: x, y: y }, this.cells[y][x]);
            }
        }
    };
    return BoardModel;
}());
exports.BoardModel = BoardModel;

cc._RF.pop();