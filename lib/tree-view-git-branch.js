'use babel';
import 'object-assign-shim';
import 'array.from';
import {CompositeDisposable} from 'atom';
import {addEventListener} from './utils.js';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('list-item', 'entry', 'file', 'tree-view-git-branch');

    this.label = this.appendChild(document.createElement('span'));
    this.label.classList.add('name', 'icon');

    this.disposables = new CompositeDisposable(
      addEventListener(this, 'click', event => this.onClick(event))
    );
  },

  destroy() {
    this.disposables.dispose();
    [this.disposables, this.repository] = [];
  },

  initialize({ icon, title, repository }) {
    this.repository = repository;
    this.setIcon(icon);
    this.setTitle(title);
  },

  setIcon(icon) {
    if(!icon) return;
    this.label.className.replace(/\bicon-[^\s]+/, `icon-${icon}`);
    // this.label.classList.add(`icon-${icon}`);
  },

  setTitle(ref) {
    this.setAttribute('data-ref', ref);

    var [, remote, shortRef] = ref.match(/refs\/(?:heads|tags|remotes\/([^/]+))\/(.+)/);
    this.label.innerHTML = remote ? `${remote}/${shortRef}` : shortRef;

    if(shortRef != this.repository.getShortHead()) {
      this.classList.add('status-ignored');
    }
  },

  onClick(event) {
    // only checkout branch on double click
    if(event.detail != 2) return;

    for(let element of Array.from(this.parentNode.childNodes)) {
      element.classList.add('status-ignored');
    }
    this.classList.remove('status-ignored');

    var ref = this.getAttribute('data-ref');

    if(this.repository.checkoutReference(ref)) {
      atom.notifications.addSuccess(`Checkout ${ref}.`);
    } else {
      atom.notifications.addError(`Checkout of ${ref} failed.`);
    }
  },

  getPath() {
    return `${this.repository.getPath().replace(/\/\.git/, '')}:git-branches/${this.getAttribute('data-ref')}`;
  },

  isPathEqual(path) {
    return path == this.getPath();
  },

  toggleExpansion() {
    /* a bug in the tree view causes the tree view to call
     * the toggleExpansion method on this branch. remove
     * this when atom/tree-view#596 is merged */
  },
});

document.registerElement('tree-view-git-branch', {
  prototype,
  extends: 'li',
});

export default function treeViewGitBranch(...args) {
  var treeViewGitBranch = document.createElement('li', 'tree-view-git-branch');
  if(args.length) treeViewGitBranch.initialize(...args);
  return treeViewGitBranch;
}
