'use babel';
import 'object-assign-shim';

import { CompositeDisposable } from 'atom';

import { addEventListener } from './utils.js';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('list-item', 'file');

    this.label = this.appendChild(document.createElement('span'));
    this.label.classList.add('name', 'icon');

    this.disposables = new CompositeDisposable(
      addEventListener(this, 'click', () => this.onClick())
    );
  },

  destroy() {
    this.disposables.dispose();
    [ this.disposables, this.repository ] = [];
  },

  initialize({ icon, title, repository }) {
    this.setIcon(icon);
    this.setTitle(title);
    this.repository = repository;
  },

  setIcon(icon) {
    if(!icon) return;
    this.icon = icon;
    this.label.className.replace(/\bicon-[^\s]+/, '');
    this.label.classList.add(`icon-${icon}`);
  },

  setTitle(title) {
    this.label.innerHTML = title;
    this.setAttribute('data-ref', title);
  },

  onClick() {
    for(let element of Array.from(document.querySelectorAll('.tree-view .selected'))) {
      element.classList.remove('selected');
    }
    this.classList.add('selected');

    this.repository.checkoutReference(this.getAttribute('data-ref'));
  },
});

var GitBranch = document.registerElement('git-branch', {
  prototype,
  extends: 'li',
});

export default function gitBranch(...args) {
  var gitBranch = new GitBranch();
  if(args.length) gitBranch.initialize(...args);
  return gitBranch;
}
