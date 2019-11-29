/**
 * list all standard events. Art error monitor will only listen to part of following 
 * events, listing all of them just for completeness.
 */
export enum Event {
  'abort' = 'abort',
  'error' = 'error',

  'load' = 'load',
  'unload' = 'unload',

  'afterprint' = 'afterprint',

  'appinstalled' = 'appinstalled',

  'audioend' = 'audioend', // experimental
  'audiostart' = 'audiostart', // experimental

  'beforeprint' = 'beforeprint',

  'canplay' = 'canplay',
  'canplaythrough' = 'canplaythrough',
  
  'change' = 'change',

  'chargingchange' = 'chargingchange', // obsolete
  'chargingtimechange' = 'chargingtimechange', // obsolete
  'dischargingtimechange' = 'dischargingtimechange', // obsolete
  'levelchange' = 'levelchange', // obsolete

  'open' = 'open',
  'close' = 'close',

  'blocked' = 'blocked', // IndexDB
  'complete' = 'complete', // IndexDB
  'success' = 'success', // IndexDB
  'upgradeneeded' = 'upgradeneeded', // IndexDB
  'versionchange' = 'versionchange', // IndexDB

  'devicechange' = 'devicechange',

  'DOMContentLoaded' = 'DOMContentLoaded',

  'durationchange' = 'durationchange',
  'emptied' = 'emptied',
  'ended' = 'ended',
  
  'end' = 'end', // experimental

  'fullscreenchange' = 'fullscreenchange',
  'fullscreenerror' = 'fullscreenerror',

  'input' = 'input',

  'invalid' = 'invalid',

  'languagechange' = 'languagechange', // experimental

  'loadeddata' = 'loadeddata',
  'loadedmetadata' = 'loadedmetadata',

  'online' = 'online',
  'offline' = 'offline',

  'orientationchange' = 'orientationchange',

  'play' = 'play',
  'playing' = 'playing',
  'pause' = 'pause',
  'ratechange' = 'ratechange',
  'seeked' = 'seeked',
  'seeking' = 'seeking',
  'stalled' = 'stalled',
  'suspend' = 'suspend',
  'timeupdate' = 'timeupdate',

  'pointerlockchange' = 'pointerlockchange',
  'pointerlockerror' = 'pointerlockerror',

  'readystatechange' = 'readystatechange',

  'reset' = 'reset',

  'selectstart' = 'selectstart', // experimental
  'selectionchange' = 'selectionchange', // experimental

  'slotchange' = 'slotchange',

  'start' = 'start', // experimental
  'soundend' = 'soundend', // experimental
  'soundstart' = 'soundstart', // experimental
  'speechend' = 'speechend', // experimental
  'speechstart' = 'speechstart', // experimental
  'voiceschanged' = 'voiceschanged', // experimental
  'volumechange' = 'volumechange',
  'waiting' = 'waiting',

  'submit' = 'submit',

  'visibilitychange' = 'visibilitychange',

  'resize' = 'resize',

  'scroll' = 'scroll',
}

export enum UIEvent {
  // 'abort' = 'abort',
  // 'error' = 'error',

  // 'load' = 'load',
  // 'unload' = 'unload',

  // 'resize' = 'resize',

  // 'scroll' = 'scroll',
  
  'select' = 'select',

  'DOMActivate' = 'DOMActivate', // deprecated
}

export enum ProgressEvent {
  'abort' = 'abort',
  'error' = 'error',
  'load' = 'load',
  'loadstart' = 'loadstart',
  'loadend' = 'loadend',
  'timeout' = 'timeout'
}

// experimental
export enum AnimationEvent {
  'animationcancel' = 'animationcancel',
  'animationend' = 'animationend',
  'animationiteration' = 'animationiteration',
  'animationstart' = 'animationstart'
}

export enum BeforeUnloadEvent {
  'beforeunload' = 'beforeunload'
}

export enum TimeEvent {
  'beginEvent' = 'beginEvent',
  'endEvent' = 'endEvent',
  'repeatEvent' = 'repeatEvent',
}

// experimental
export enum FocusEvent {
  'blur' = 'blur',
  'focus' = 'focus',
  'focusin' = 'focusin',
  'focusout' = 'focusout',

  'DOMFocusIn' = 'DOMFocusIn', // deprecated
  'DOMFocusOut' = 'DOMFocusOut', // deprecated
}

export enum SpeechSynthesisEvent {
  'boundary' = 'boundary',

  'start' = 'start',
  'end' = 'end', // experimental
  'mark' = 'mark', // experimental
  'pause' = 'pause', // experimental
  'resume' = 'resume', // experimental
}

export enum MouseEvent {
  'click' = 'click',
  'contextmenu' = 'contextmenu',
  'dblclick' = 'dblclick',

  'mousedown' = 'mousedown',
  'mouseenter' = 'mouseenter',
  'mouseleave' = 'mouseleave',
  'mousemove' = 'mousemove',
  'mouseout' = 'mouseout',
  'mouseover' = 'mouseover',
  'mouseup' = 'mouseup',

  'show' = 'show', // deprecated
}

export enum CompositionEvent {
  'compositionstart' = 'compositionstart',
  'compositionupdate' = 'compositionupdate',
  'compositionend' = 'compositionend'
}

// experimental
export enum ClipboardEvent {
  'copy' = 'copy',
  'cut' = 'cut',
  'paste' = 'paste'
}

// experimental
export enum DeviceMotionEvent {
  'devicemotion' = 'devicemotion',
  'deviceorientation' = 'deviceorientation'
}

export enum MutationEvent {
  'DOMAttrModified' = 'DOMAttrModified', // deprecated
  'DOMCharacterDataModified' = 'DOMCharacterDataModified', // deprecated
  'DOMNodeInserted' = 'DOMNodeInserted', // deprecated
  'DOMNodeInsertedIntoDocument' = 'DOMNodeInsertedIntoDocument', // deprecated
  'DOMNodeRemoved' = 'DOMNodeRemoved', // deprecated
  'DOMNodeRemovedFromDocument' = 'DOMNodeRemovedFromDocument', // deprecated
  'DOMSubtreeModified' = 'DOMSubtreeModified', // deprecated
}

export enum DragEvent {
  'drag' = 'drag',
  'dragend' = 'dragend',
  'dragenter' = 'dragenter',
  'dragleave' = 'dragleave',
  'dragover' = 'dragover',
  'dragstart' = 'dragstart',
  'drop' = 'drop'
}

// experimental
export enum SpeechSynthesisErrorEvent {
  'error' = 'error'
}

// experimental
export enum GamepadEvent {
  'gamepadconnected' = 'gamepadconnected',
  'gamepaddisconnected' = 'gamepaddisconnected',
}

export enum PointerEvent {
  'gotpointercapture' = 'gotpointercapture',
  'lostpointercapture' = 'lostpointercapture',
  'pointercancel' = 'pointercancel',
  'pointerdown' = 'pointerdown',
  'pointerenter' = 'pointerenter',
  'pointerleave' = 'pointerleave',
  'pointermove' = 'pointermove',
  'pointerout' = 'pointerout',
  'pointerover' = 'pointerover',
  'pointerup' = 'pointerup'
}

export enum HashChangeEvent {
  'hashchange' = 'hashchange',
}

export enum KeyboardEvent {
  'keydown' = 'keydown',
  'keypress' = 'keypress', // deprecated
  'keyup' = 'keyup'
}

export enum MessageEvent {
  'message' = 'message',
  'messageerror' = 'messageerror'
}

export enum ServiceWorkerMessageEventOrExtendableMessageEvent {
  'message' = 'message' // experimental
}

// experimental
export enum SpeechRecognitionEvent {
  'nomatch' = 'nomatch',
  'result' = 'result'
}

// experimental
export enum NotificationEvent {
  'notificationclick' = 'notificationclick'
}

export enum PageTransitionEvent {
  'pagehide' = 'pagehide',
  'pageshow' = 'pageshow',
}

export enum PopStateEvent {
  'popstate' = 'popstate',
  'progress' = 'progress'
}

// experimental
export enum PushEvent {
  'push' = 'push',
  'pushsubscriptionchange' = 'pushsubscriptionchange'
}

export enum Performance {
  'resourcetimingbufferfull' = 'resourcetimingbufferfull'
}

export enum StorageEvent {
  'storage' = 'storage'
}

export enum SVGEvent {
  'SVGAbort' = 'SVGAbort',
  'SVGError' = 'SVGError',
  'SVGLoad' = 'SVGLoad',
  'SVGResize' = 'SVGResize',
  'SVGScroll' = 'SVGScroll',
  'SVGUnload' = 'SVGUnload',
}

export enum SVGZoomEvent {
  'SVGZoom' = 'SVGZoom'
}

export enum TouchEvent {
  'touchcancel' = 'touchcancel',
  'touchend' = 'touchend',
  'touchmove' = 'touchmove',
  'touchstart' = 'touchstart',
}

// experimental
export enum TransitionEvent {
  'transitionend' = 'transitionend'
}

// experimental
export enum UserProximityEvent {
  'userproximity' = 'userproximity'
}

export enum WheelEvent {
  'wheel' = 'wheel'
}

export enum CustomEvent {
  'statechange' = 'statechange'
}

// deprecated
// export enum AudioProcessingEvent {}

// deprecated
// export enum OfflineAudioCompletionEvent {
//   'complete' = 'complete'
// }

// deprecated
// export enum MutationNameEvent {
//   'DOMAttributeNameChanged' = 'DOMAttributeNameChanged',
//   'DOMElementNameChanged' = 'DOMElementNameChanged'
// }