'use babel';
import 'object-assign-shim';

import 'array.from';

import { CompositeDisposable } from 'atom';

import { addEventListener } from './utils.js';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('list-item', 'file', 'tree-view-git-branch');

    this.label = this.appendChild(document.createElement('span'));
    this.label.classList.add('name', 'icon');

    this.disposables = new CompositeDisposable(
      addEventListener(this, 'click', event => this.onClick(event))
    );
  },

  destroy() {
    this.disposables.dispose();
    [ this.disposables, this.repository ] = [];
  },

  initialize({ icon, title, repository }) {
    this.repository = repository;
    this.setIcon(icon);
    this.setTitle(title);
  },

  setIcon(icon) {
    if(!icon) return;
    this.label.className.replace(/\bicon-[^\s]+/, '');
    this.label.classList.add(`icon-${icon}`);
  },

  setTitle(ref) {
    this.setAttribute('data-ref', ref);

    var [, remote, shortRef] = ref.match(/refs\/(?:heads|tags|remotes\/([^/]+))\/(.+)/);
    this.label.innerHTML = remote ? `${remote}/${shortRef}` : shortRef;

    if(shortRef == this.repository.getShortHead()) {
      this.classList.add('text-info');
    }
  },

  onClick(event) {
    for(let element of Array.from(document.querySelectorAll('.tree-view .selected'))) {
      element.classList.remove('selected');
    }
    this.classList.add('selected');

    // only checkout branch on double click
    if(event.detail != 2) return;

    for(let element of Array.from(document.querySelectorAll('.tree-view .tree-view-git-branch.text-info'))) {
      element.classList.remove('text-info');
    }
    this.classList.add('text-info');

    var ref = this.getAttribute('data-ref');

    if(this.repository.checkoutReference(ref)) {
      atom.notifications.addSuccess(`Checkout ${ref}.`);
    } else {
      atom.notifications.addError(`Checkout of ${ref} failed.`);
    }
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
