'use babel';
import { Disposable } from 'atom';

export function addEventListener(el, event, cb) {
  el.addEventListener(event, cb);
  return new Disposable(() => el.removeEventListener(event, cb));
}
