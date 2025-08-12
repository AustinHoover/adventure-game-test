import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';

/**
 * Action node that makes a character wait for a specified amount of time
 */
export class WaitNode extends ActionNode {
  private startTime: number = 0;
  private isWaiting: boolean = false;

  constructor(private waitTime: number) {
    super('Wait Action');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;

    // Start waiting if we haven't started yet
    if (!this.isWaiting) {
      this.startTime = currentTime;
      this.isWaiting = true;
      return BehaviorStatus.RUNNING;
    }

    // Check if we've waited long enough
    if (currentTime - this.startTime >= this.waitTime) {
      this.isWaiting = false;
      return BehaviorStatus.SUCCESS;
    }

    // Still waiting
    return BehaviorStatus.RUNNING;
  }

  reset(): void {
    super.reset();
    this.startTime = 0;
    this.isWaiting = false;
  }
}
