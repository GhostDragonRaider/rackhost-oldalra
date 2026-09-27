/**
 * Data integrity helpers — never present invented numbers as REAL measurements.
 */

export type DataProvenance =
  | "real"
  | "estimated"
  | "test"
  | "simulated"
  | "unavailable"
  | "unknown";

export type MeasurementStatus = "ok" | "error" | "unavailable" | "unknown";

export type MeasuredValue<T> = {
  value: T | null;
  provenance: DataProvenance;
  source: string | null;
  measuredAt: string | null;
  measurementStatus: MeasurementStatus;
  error: string | null;
  lastSuccessfulMeasurement: string | null;
  /** Optional reliability 0–1 when meaningful */
  confidence: number | null;
};

export function measuredReal<T>(
  value: T,
  source: string,
  at = new Date().toISOString()
): MeasuredValue<T> {
  return {
    value,
    provenance: "real",
    source,
    measuredAt: at,
    measurementStatus: "ok",
    error: null,
    lastSuccessfulMeasurement: at,
    confidence: 1,
  };
}

export function measuredUnavailable<T = never>(
  reason: string,
  source: string | null = null,
  lastSuccessful: string | null = null
): MeasuredValue<T> {
  return {
    value: null,
    provenance: "unavailable",
    source,
    measuredAt: null,
    measurementStatus: "unavailable",
    error: reason,
    lastSuccessfulMeasurement: lastSuccessful,
    confidence: null,
  };
}

export function measuredError<T = never>(
  error: string,
  source: string | null = null,
  lastSuccessful: string | null = null
): MeasuredValue<T> {
  return {
    value: null,
    provenance: "unknown",
    source,
    measuredAt: new Date().toISOString(),
    measurementStatus: "error",
    error,
    lastSuccessfulMeasurement: lastSuccessful,
    confidence: null,
  };
}

export function measuredEstimated<T>(
  value: T,
  source: string,
  note: string,
  at = new Date().toISOString()
): MeasuredValue<T> & { estimateNote: string } {
  return {
    value,
    provenance: "estimated",
    source,
    measuredAt: at,
    measurementStatus: "ok",
    error: null,
    lastSuccessfulMeasurement: at,
    confidence: 0.5,
    estimateNote: note,
  };
}

export const PROVENANCE_LABELS: Record<DataProvenance, string> = {
  real: "REAL",
  estimated: "ESTIMATED",
  test: "TEST",
  simulated: "SIMULATED",
  unavailable: "UNAVAILABLE",
  unknown: "UNKNOWN",
};
