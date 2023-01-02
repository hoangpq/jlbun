import { nextTick } from "process";
import {
  jlbun,
  Julia,
  JuliaFunction,
  JuliaSymbol,
  JuliaValue,
  MethodError,
} from "./index.js";

/**
 * Wrapper for Julia `Task`s.
 */
export class JuliaTask implements JuliaValue {
  ptr: number;
  canReschedule: boolean;
  scheduled: boolean;

  constructor(ptr: number, canReschedule = false) {
    this.ptr = ptr;
    this.canReschedule = canReschedule;
    this.scheduled = false;
  }

  /**
   * Wrap a 0-arg `JuliaFunction` as a `JuliaTask`.
   *
   * @param func The function to be wrapped.
   */
  static from(func: JuliaFunction): JuliaTask {
    const task = Julia.Base.Task(func);
    return new JuliaTask(task.ptr, true);
  }

  /**
   * Designate a `JuliaTask` to the specified thread.
   *
   * @param threadId The desired thread ID this task should be designated to.
   */
  schedule(threadId: number): JuliaTask {
    if (!this.canReschedule) {
      throw new MethodError("This task cannot be rescheduled");
    }

    if (threadId < 0 || threadId > Julia.nthreads) {
      throw new MethodError(
        `threadId must be between 0 and ${Julia.nthreads - 1}`,
      );
    }
    jlbun.symbols.jl_set_task_tid(this.ptr, threadId);
    return this;
  }

  /**
   * Schedule a `JuliaTask` and get a `Promise` representing the result of the task.
   */
  get value(): Promise<JuliaValue> {
    return new Promise((resolve, reject) => {
      if (!Julia.Base.istaskstarted(this).value && !this.scheduled) {
        Julia.Base.schedule(this);
        this.scheduled = true;
      }

      nextTick(() => {
        Julia.Base.wait(this);
        if (Julia.Base.istaskdone(this).value) {
          const result = Julia.Core.getproperty(
            this,
            JuliaSymbol.from("result"),
          );
          if (Julia.Base.istaskfailed(this).value) {
            reject(result);
          } else {
            resolve(result);
          }
        }
      });
    });
  }

  /**
   * Stringify the underlying Julia `Task`.
   */
  toString(): string {
    return Julia.string(this);
  }
}
