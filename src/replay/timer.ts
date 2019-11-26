import { PlayerConfig, Actions } from "./types";

export class Timer {
  constructor(playerConfig: PlayerConfig, actions: Actions[]) {
    this.playerConfig = playerConfig;
    this.actions = actions;
  }
  private playerConfig: PlayerConfig;
  private actions: Actions[];
  private raf: number;

  public start() {
    this.actions.sort((prevAction, nextAction) => {
      return prevAction.delay - nextAction.delay;
    });
    let timeElapsed = 0;
    let lastTimestamp = performance.now();
    const { actions, playerConfig } = this;
    const self = this;
    function check(time: number) {
      timeElapsed = timeElapsed + (time - lastTimestamp) * playerConfig.speed;
      lastTimestamp = time;
      while (actions.length) {
        const currentAction = actions[0];
        if (timeElapsed >= currentAction.delay) {
          actions.shift();
          currentAction.action();
        } else {
          break;
        }
      }

      if (actions.length > 0 || playerConfig.liveMode) {
        self.raf = requestAnimationFrame(check);
      }
    }
    this.raf = requestAnimationFrame(check);
  }

  public clear() {
    if (this.raf) {
      cancelAnimationFrame(this.raf);
    }
    this.actions.length = 0;
  }
}