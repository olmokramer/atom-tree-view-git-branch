'use babel';
import 'object-assign-shim';

import 'array.from';

import { CompositeDisposable } from 'atom';

import gitBranch from './git-branch.js';

import { addEventListener } from './utils.js';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('list-nested-item', 'directory', 'git-branch');

    this.header = this.appendChild(document.createElement('div'));
    this.header.classList.add('header', 'list-item');

    this.label = this.header.appendChild(document.createElement('span'));
    this.label.classList.add('name', 'icon');

    this.entries = this.appendChild(document.createElement('ol'));
    this.entries.classList.add('list-tree');
    this.collapse();

    this.disposables = new CompositeDisposable(
      addEventListener(this.header, 'click', () => this.toggle())
    );
  },

  destroy() {
    this.disposables.dispose();
    this.disposables = null;
  },

  initialize({ icon, title, entries, repository }) {
    this.setIcon(icon);
    this.setTitle(title);
    this.setEntries(entries, repository);
  },

  setIcon(icon) {
    if(!icon) return;
    this.icon = icon;
    this.label.className.replace(/\bicon-[^\s]+/, '');
    this.label.classList.add(`icon-${icon}`);
  },

  setTitle(title) {
    this.title = title;
    this.label.innerHTML = title;
  },

  setEntries(entries, repository) {
    this.entries.innerHTML = '';
    for(let entry of entries) {
      this.entries.appendChild(gitBranch({
        title: entry,
        repository,
      }));
    }
  },

  expand() {
    if(!this.collapsed) return;
    this.collapsed = false;
    this.classList.remove('collapsed');

    this.entries.style.display = '';
  },

  collapse() {
    if(this.collapsed) return;
    this.collapsed = true;
    this.classList.add('collapsed');

    this.entries.style.display = 'none';
  },

  toggle() {
    for(let element of Array.from(document.querySelectorAll('.tree-view .selected'))) {
      element.classList.remove('selected');
    }
    this.classList.add('selected');
    this.collapsed ? this.expand() : this.collapse();
  },
});

var GitBranchList = document.registerElement('git-branch-list', {
  prototype,
  extends: 'li',
});

export default function gitBranchList(...args) {
  var gitBranchList = new GitBranchList();
  if(args.length) gitBranchList.initialize(...args);
  return gitBranchList;
}
