import { ActionNode, BehaviorContext, BehaviorStatus } from '../BehaviorTree';

/**
 * Action node that makes a character investigate detected threats
 */
export class InvestigateThreatActionNode extends ActionNode {
  private investigationStartTime: number = 0;
  private investigationDuration: number = 10000; // 10 seconds to investigate
  private hasStartedInvestigation: boolean = false;

  constructor() {
    super('Investigate Threat');
  }

  execute(context: BehaviorContext): BehaviorStatus {
    const currentTime = context.currentTime;

    // Start investigation if we haven't started yet
    if (!this.hasStartedInvestigation) {
      this.investigationStartTime = currentTime;
      this.hasStartedInvestigation = true;
      return BehaviorStatus.RUNNING;
    }

    // Check if investigation is complete
    if (currentTime - this.investigationStartTime >= this.investigationDuration) {
      return BehaviorStatus.SUCCESS;
    }

    // Still investigating
    return BehaviorStatus.RUNNING;
  }

  reset(): void {
    super.reset();
    this.investigationStartTime = 0;
    this.hasStartedInvestigation = false;
  }
}
