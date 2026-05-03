const { ccclass, property } = cc._decorator;

@ccclass
export default class TileView extends cc.Component {
  @property
  destroyTweenDuration = 0.3;

  @property
  destroyTweenScaleUp = 1.1;

  @property
  destroyScaleUpEasing = "sineOut";

  @property
  destroyScaleDownEasing = "sineIn";

  @property
  missClickDuration = 0.3;

  @property
  missClickScaleUp = 1.1;

  @property
  missClickScaleUpEasing = "sineOut";

  @property
  missClickScaleDownEasing = "sineIn";

  @property
  rocketFlyDuration = 0.3;

  @property
  rocketFlyEasing = "sineOut";

  @property
  bombBlastExpandDuration = 0.15;

  @property
  bombBlastHoldDuration = 0.1;

  @property
  bombBlastCollapseDuration = 0.15;

  @property
  bombBlastExpandEasing = "sineOut";

  @property
  bombBlastCollapseEasing = "sineIn";

  @property
  effectZIndex = 1000;

  @property(cc.Node)
  rocketLeftNode: cc.Node = null as any;

  @property(cc.Node)
  rocketRightNode: cc.Node = null as any;

  @property(cc.Node)
  rocketUpNode: cc.Node = null as any;

  @property(cc.Node)
  rocketDownNode: cc.Node = null as any;

  playDestroyAnimation(): Promise<void> {
    const duration = Math.max(0.01, this.destroyTweenDuration);
    const upDuration = duration * 0.35;
    const downDuration = duration * 0.65;
    return this.playScaleTween(
      this.node,
      this.destroyTweenScaleUp,
      0,
      upDuration,
      downDuration,
      this.destroyScaleUpEasing,
      this.destroyScaleDownEasing
    );
  }

  playMissClickAnimation(): Promise<void> {
    const duration = Math.max(0.01, this.missClickDuration);
    const upDuration = duration * 0.45;
    const downDuration = duration * 0.55;
    return this.playScaleTween(
      this.node,
      this.missClickScaleUp,
      1,
      upDuration,
      downDuration,
      this.missClickScaleUpEasing,
      this.missClickScaleDownEasing
    );
  }

  playLineBlastEffect(isHorizontal: boolean, negativeDistance: number, positiveDistance: number): Promise<void> {
    const negativeRocket = isHorizontal ? this.rocketLeftNode : this.rocketDownNode;
    const positiveRocket = isHorizontal ? this.rocketRightNode : this.rocketUpNode;
    const rocketsCount = (negativeRocket ? 1 : 0) + (positiveRocket ? 1 : 0);
    if (rocketsCount === 0) {
      return Promise.resolve();
    }
    const rootSprite = this.getComponent(cc.Sprite);
    if (rootSprite) {
      rootSprite.enabled = false;
    }
    const duration = Math.max(0.01, this.rocketFlyDuration);
    return new Promise((resolve): void => {
      this.node.zIndex = this.effectZIndex;
      const tasks: Array<Promise<void>> = [];
      if (negativeRocket && negativeRocket.isValid) {
        negativeRocket.active = true;
        negativeRocket.zIndex = this.effectZIndex + 1;
      }
      tasks.push(this.flyRocket(negativeRocket, isHorizontal, -negativeDistance, duration));
      if (positiveRocket && positiveRocket.isValid) {
        positiveRocket.active = true;
        positiveRocket.zIndex = this.effectZIndex + 1;
      }
      tasks.push(this.flyRocket(positiveRocket, isHorizontal, positiveDistance, duration));
      Promise.all(tasks).then((): void => {
        resolve();
      });
    });
  }

  private flyRocket(rocket: cc.Node | null, isHorizontal: boolean, offset: number, duration: number): Promise<void> {
    if (!rocket || !rocket.isValid) {
      return Promise.resolve();
    }
    const start = rocket.position.clone();
    const target = isHorizontal
      ? cc.v3(start.x + offset, start.y, start.z)
      : cc.v3(start.x, start.y + offset, start.z);
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(rocket);
      cc.tween(rocket)
        .to(duration, { position: target }, { easing: this.rocketFlyEasing || "sineOut" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }

  playBombBlastEffect(radius: number, stepX: number, stepY: number, onImpact?: () => void): Promise<void> {
    const rootSprite = this.getComponent(cc.Sprite);
    if (rootSprite) {
      rootSprite.enabled = true;
    }
    const baseWidth = Math.max(1, this.node.width);
    const baseHeight = Math.max(1, this.node.height);
    const safeStepX = Math.max(1, stepX);
    const safeStepY = Math.max(1, stepY);
    const diameter = Math.max(1, radius * 2 + 1);
    const targetScaleX = (diameter * safeStepX) / baseWidth;
    const targetScaleY = (diameter * safeStepY) / baseHeight;
    const expandDuration = Math.max(0.01, this.bombBlastExpandDuration);
    const holdDuration = Math.max(0, this.bombBlastHoldDuration);
    const collapseDuration = Math.max(0.01, this.bombBlastCollapseDuration);
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(this.node);
      this.node.zIndex = this.effectZIndex;
      this.node.setScale(1, 1);
      cc.tween(this.node)
        .to(
          expandDuration,
          { scaleX: targetScaleX, scaleY: targetScaleY },
          { easing: this.bombBlastExpandEasing || "sineOut" }
        )
        .call((): void => {
          if (onImpact) {
            onImpact();
          }
        })
        .delay(holdDuration)
        .to(collapseDuration, { scaleX: 0, scaleY: 0 }, { easing: this.bombBlastCollapseEasing || "sineIn" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }

  private playScaleTween(
    target: cc.Node,
    upScale: number,
    downScale: number,
    upDuration: number,
    downDuration: number,
    upEasing: string,
    downEasing: string
  ): Promise<void> {
    return new Promise((resolve): void => {
      cc.Tween.stopAllByTarget(target);
      target.setScale(1, 1);
      cc.tween(target)
        .to(upDuration, { scale: upScale }, { easing: upEasing || "sineOut" })
        .to(downDuration, { scale: downScale }, { easing: downEasing || "sineIn" })
        .call((): void => {
          resolve();
        })
        .start();
    });
  }
}
