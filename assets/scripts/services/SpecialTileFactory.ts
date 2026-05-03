import { GridPosition, SpecialTileType } from "../models/types";

export class SpecialTileFactory {
  decideSpecial(group: GridPosition[], clicked: GridPosition, superTileLineRequirement: number): SpecialTileType {
    if (group.length < superTileLineRequirement) {
      return SpecialTileType.None;
    }
    let horizontal = 0;
    let vertical = 0;
    for (let i = 0; i < group.length; i++) {
      if (group[i].y === clicked.y) {
        horizontal++;
      }
      if (group[i].x === clicked.x) {
        vertical++;
      }
    }
    if (horizontal >= superTileLineRequirement && vertical >= superTileLineRequirement) {
      return SpecialTileType.Bomb;
    }
    if (horizontal >= superTileLineRequirement) {
      return SpecialTileType.RocketHorizontal;
    }
    if (vertical >= superTileLineRequirement) {
      return SpecialTileType.RocketVertical;
    }

    return SpecialTileType.None;
  }
}
