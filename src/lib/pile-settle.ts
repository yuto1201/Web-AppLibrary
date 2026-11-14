/** 物理が 1 フレームで進める最大の時間（秒）。 */
export const MAX_STEP_SECONDS = 0.05;

/**
 * 板が落ち着くまでの時計を進める。足すのは物理が実際に進めた時間だけ。
 * タブを裏に回した時間や、とても遅いフレームの待ち時間で、空中の板を眠らせないため。
 */
export function advanceSettle(idleSeconds: number, elapsedSeconds: number): number {
  return idleSeconds + Math.min(Math.max(elapsedSeconds, 0), MAX_STEP_SECONDS);
}
