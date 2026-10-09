"use client";

import { MAX_PHASE, PHASE_INDEX, type Phase } from "./formations";

/**
 * Deliberately a mutable singleton rather than React state. Scroll updates
 * the phase on every frame, and routing that through React would re-render
 * the tree sixty times a second for a value only the GPU reads.
 */
type SignalStore = {
  /** Target position along the narrative, 0..6. */
  phase: number;
  /** Eased value actually handed to the shader. */
  rendered: number;
  /** Chapters per second. Used by the organic morph; zeroed on a hard cut. */
  phaseVel: number;
  /** Overall brightness. */
  intensity: number;
  /** Contact-form completion, 0..1. */
  resolve: number;
  /** Cluster or tier to pull forward; -1 is none. */
  focus: number;
  /** Seconds since focus last changed. Devices ease down from this. */
  focusAge: number;
  /** Yaw of the focused industry mark. Advances only while zoomed, so a click
   *  does not have to catch up to the time the page has been open. */
  iconSpin: number;
  /** Strategy-row picture, 0..5. -1 means the chapter formation is showing. */
  scene: number;
  /** Which row to draw while sceneMix eases back to the chapter. */
  sceneShown: number;
  /** 0 = chapter formation, 1 = the service picture. */
  sceneMix: number;
  /** 0 = wide field, 1 = star-system zoom into the focused cluster. */
  zoom: number;
  zoomR: number;
  /** 0 = the chapter formation, 1 = the unmanaged cloud, blended directly. */
  cloud: number;
  cloudR: number;
  /** 1 hides the field. Held across the industry handoff so the die cannot flash. */
  cover: number;
  /** 1 forces every point onto the unmanaged cloud until the industries chapter returns. */
  handoff: number;
  lookX: number;
  lookY: number;
  /** Pointer in NDC, -1..1. */
  mouseX: number;
  mouseY: number;
  mouseRX: number;
  mouseRY: number;
  /** False until the first real pointer sample, so the glow does not ease from 0,0. */
  mouseLive: boolean;
  /** 0 while the pointer is on frosted glass, so the field light does not stack. */
  fieldGlow: number;
  /** Set by the field so callers can wake a demand-driven frameloop. */
  invalidate: (() => void) | null;
};

export const signal: SignalStore = {
  phase: 0,
  rendered: 0,
  phaseVel: 0,
  intensity: 1,
  resolve: 0,
  focus: -1,
  focusAge: 0,
  iconSpin: 0,
  scene: -1,
  sceneShown: 0,
  sceneMix: 0,
  zoom: 0,
  zoomR: 0,
  cloud: 0,
  cloudR: 0,
  cover: 0,
  handoff: 0,
  lookX: 0,
  lookY: 0,
  mouseX: 0,
  mouseY: 0,
  mouseRX: 0,
  mouseRY: 0,
  mouseLive: false,
  fieldGlow: 1,
  invalidate: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let chapterIndex = 0;

function emitChapter() {
  const next = Math.round(signal.phase);
  if (next === chapterIndex) return;
  chapterIndex = next;
  listeners.forEach((fn) => fn());
}

export function subscribeChapter(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getChapterIndex() {
  return chapterIndex;
}

/**
 * Set while a route is taking the field to a specific chapter. Scroll
 * triggers on the page being left must not drag the field back through
 * the earlier chapters on the way out.
 */
let heldPhase: number | null = null;

function writePhase(value: number) {
  signal.phase = value;
  if (typeof document !== "undefined") {
    document.documentElement.dataset.signalPhase = String(signal.phase);
  }
  emitChapter();
  signal.invalidate?.();
}

export function setPhase(next: number | Phase) {
  const value = typeof next === "number" ? next : PHASE_INDEX[next];
  const clamped = Math.min(MAX_PHASE, Math.max(0, value));
  if (heldPhase !== null && clamped !== heldPhase) return;
  writePhase(clamped);
}

/** Pin the field on this chapter and ignore scroll updates until the story page returns. */
export function holdPhase(next: number | Phase) {
  const value = typeof next === "number" ? next : PHASE_INDEX[next];
  heldPhase = Math.min(MAX_PHASE, Math.max(0, value));
  signal.rendered = heldPhase;
  signal.phaseVel = 0;
  writePhase(heldPhase);
}

export function releasePhaseHold() {
  heldPhase = null;
}

/** Jump without easing — used on route changes so pages do not animate in. */
export function snapPhase(next: number | Phase) {
  holdPhase(next);
}

export function setIntensity(value: number) {
  signal.intensity = Math.max(0, value);
  signal.invalidate?.();
}

export function setResolve(value: number) {
  signal.resolve = Math.min(1, Math.max(0, value));
  signal.invalidate?.();
}

const focusListeners = new Set<Listener>();

export function subscribeFocus(fn: Listener) {
  focusListeners.add(fn);
  return () => {
    focusListeners.delete(fn);
  };
}

export function getFocus() {
  return signal.focus;
}

export function setFocus(cluster: number | null) {
  const next = cluster ?? -1;
  if (next !== signal.focus) {
    signal.focus = next;
    signal.focusAge = 0;
    signal.iconSpin = 0;
    focusListeners.forEach((fn) => fn());
  }
  signal.invalidate?.();
}

/**
 * Show a strategy-row picture without moving the chapter phase.
 * Pass null to return to the chapter. `immediate` skips the mix, for
 * route changes where the field should not animate through the old row.
 */
export function setScene(next: number | null, immediate = false) {
  if (next === null) {
    signal.scene = -1;
    if (immediate) signal.sceneMix = 0;
  } else {
    const value = Math.min(5, Math.max(0, next));
    signal.scene = value;
    signal.sceneShown = value;
    if (immediate) signal.sceneMix = 1;
  }
  signal.invalidate?.();
}

export function setZoom(value: number) {
  signal.zoom = Math.min(1, Math.max(0, value));
  signal.invalidate?.();
}

/**
 * The dive through an industry face belongs to the homepage die alone.
 * A click on one of its faces arms the zoom for the next industry page;
 * every other way onto that page gets a plain cut. The window is short so
 * a press that never navigates cannot arm a later visit.
 */
const CUBE_ARM_MS = 3000;
let cubeArmedAt = 0;

export function armCubeZoom() {
  cubeArmedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
}

export function disarmCubeZoom() {
  cubeArmedAt = 0;
}

export function cubeZoomArmed() {
  if (!cubeArmedAt) return false;
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  return now - cubeArmedAt < CUBE_ARM_MS;
}

/** Blend the live field straight to the unmanaged cloud. `immediate` skips the ease. */
export function setCloud(value: number, immediate = false) {
  signal.cloud = value > 0.5 ? 1 : 0;
  if (immediate) signal.cloudR = signal.cloud;
  signal.invalidate?.();
}

export function setLook(x: number, y: number) {
  signal.lookX = x;
  signal.lookY = y;
  signal.invalidate?.();
}

export function setFieldGlow(on: boolean) {
  signal.fieldGlow = on ? 1 : 0;
  signal.invalidate?.();
}

export function setMouse(x: number, y: number) {
  if (!signal.mouseLive) {
    signal.mouseRX = x;
    signal.mouseRY = y;
    signal.mouseLive = true;
  }
  signal.mouseX = x;
  signal.mouseY = y;
  signal.invalidate?.();
}
