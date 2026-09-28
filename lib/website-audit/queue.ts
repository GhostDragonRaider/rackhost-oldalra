/**
 * In-process audit concurrency queue for VPS protection.
 * QUEUED when capacity is full; never unbounded parallel audits.
 */

type Job = {
  id: string;
  run: () => Promise<void>;
};

const MAX_CONCURRENT = Math.max(
  1,
  Number(process.env.AUDIT_MAX_CONCURRENT || 1) || 1
);
const MAX_QUEUE = Math.max(
  1,
  Number(process.env.AUDIT_MAX_QUEUE || 8) || 8
);

let active = 0;
const queue: Job[] = [];

export function auditQueueStats() {
  return {
    active,
    queued: queue.length,
    maxConcurrent: MAX_CONCURRENT,
    maxQueue: MAX_QUEUE,
  };
}

function pump() {
  while (active < MAX_CONCURRENT && queue.length > 0) {
    const job = queue.shift()!;
    active += 1;
    void job
      .run()
      .catch(() => {
        /* runner persists failure on record */
      })
      .finally(() => {
        active -= 1;
        pump();
      });
  }
}

/**
 * Enqueue an audit job. Returns false if queue is full.
 */
export function enqueueAuditJob(
  id: string,
  run: () => Promise<void>
): { ok: true; position: number } | { ok: false; error: string } {
  if (queue.length >= MAX_QUEUE && active >= MAX_CONCURRENT) {
    return {
      ok: false,
      error:
        "Az ellenőrző sor tele van. Próbáld újra néhány perc múlva (QUEUED limit).",
    };
  }
  queue.push({ id, run });
  const position = active + queue.length;
  pump();
  return { ok: true, position };
}
