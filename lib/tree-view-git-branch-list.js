'use babel';
import 'object-assign-shim';
import 'array.from';
import {CompositeDisposable} from 'atom';
import treeViewGitBranch from './tree-view-git-branch.js';
import {addEventListener} from './utils.js';

var prototype = Object.create(HTMLElement.prototype);

Object.assign(prototype, {
  createdCallback() {
    this.classList.add('list-nested-item', 'entry', 'directory', 'tree-view-git-branch-list');

    this.header = this.appendChild(document.createElement('div'));
    this.header.classList.add('header', 'list-item');

    this.label = this.header.appendChild(document.createElement('span'));
    this.label.classList.add('name', 'icon');

    this.entriesByReference = {};
    this.entries = this.appendChild(document.createElement('ol'));
    this.entries.classList.add('list-tree', 'entries');
    this.collapse();

    this.disposables = new CompositeDisposable(
      addEventListener(this.header, 'click', () => this.toggleExpansion())
    );
  },

  destroy() {
    this.remove();
    this.disposables.dispose();
    [this.disposables, this.repository] = [];
  },

  initialize({icon, title, entries, repository}) {
    this.repository = repository;
    this.setIcon(icon);
    this.setTitle(title);
    this.setEntries(entries);
  },

  setIcon(icon) {
    if(!icon) return;
    this.label.className.replace(/\bicon-[^\s]+/, '');
    this.label.classList.add(`icon-${icon}`);
  },

  setTitle(title) {
    this.title = title;
    this.label.innerHTML = title;
  },

  setEntries(references) {
    this.entries.innerHTML = '';
    for(let reference of references) {
      this.entries.appendChild(treeViewGitBranch({
        title: reference,
        repository: this.repository,
      }));
    }
  },

  expand() {
    if(!this.collapsed) return;
    this.collapsed = false;
    this.classList.add('expanded');
    this.classList.remove('collapsed');

    this.entries.style.display = '';
  },

  collapse() {
    if(this.collapsed) return;
    this.collapsed = true;
    this.classList.remove('expanded');
    this.classList.add('collapsed');

    this.entries.style.display = 'none';
  },

  toggleExpansion() {
    this.collapsed ? this.expand() : this.collapse();
  },

  getPath() {
    return `${this.repository.getPath().replace(/\/\.git/, '')}:git-branches`;
  },

  isPathEqual(path) {
    return path == this.getPath();
  },
});

document.registerElement('tree-view-git-branch-list', {
  prototype,
  extends: 'li',
});

export default function treeViewGitBranchList(...args) {
  var treeViewGitBranchList = document.createElement('li', 'tree-view-git-branch-list');
  if(args.length) treeViewGitBranchList.initialize(...args);
  return treeViewGitBranchList;
}
