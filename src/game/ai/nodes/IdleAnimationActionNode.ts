import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';

/**
 * Action node that makes a character perform idle animations
 */
export class IdleAnimationActionNode extends ActionNode {
  private startTime: number = 0;
  private animationDuration: number = 3000; // 3 seconds for idle animation

  constructor() {
    super('Idle Animation');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;

    // Start animation if we haven't started yet
    if (this.startTime === 0) {
      this.startTime = currentTime;
      return BehaviorStatus.RUNNING;
    }

    // Check if animation is complete
    if (currentTime - this.startTime >= this.animationDuration) {
      return BehaviorStatus.SUCCESS;
    }

    // Still animating
    return BehaviorStatus.RUNNING;
  }

  reset(): void {
    super.reset();
    this.startTime = 0;
  }
}
