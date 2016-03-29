'use babel';
import {basename, dirname} from 'path';
import {CompositeDisposable} from 'atom';
import makeTreeViewGitBranchList from './tree-view-git-branch-list.js';
import {addEventListener} from './utils.js';

var repositoryProto = {
  initialize(repository, treeViewEl) {
    this.repository = repository;
    this.projectRoot = this.getProjectRoot(treeViewEl);
    this.branches = makeTreeViewGitBranchList({
      repository: repository,
      icon: 'git-branch',
      title: `branches [${basename(dirname(repository.getPath()))}]`,
    });

    this.update(treeViewEl);

    this.disposables = new CompositeDisposable(
      addEventListener(this.projectRoot, 'click', event => {
        if (event.target.closest('li') == this.projectRoot) {
          this.updateLocation(treeViewEl);
        }
      }),

      atom.commands.add(treeViewEl, {
        'tree-view:expand-item': () => {
          this.updateLocation(treeViewEl);
        },
        'tree-view:expand-recursive-directory': () => {
          this.updateLocation(treeViewEl);
        },
      }),

      repository.onDidChangeStatus(() => {
        this.update(treeViewEl);
      }),

      repository.onDidChangeStatuses(() => {
        this.update(treeViewEl);
      })
    );
  },

  destroy() {
    this.branches.destroy();
    this.disposables.dispose();
    [this.branches, this.disposables,
      this.repository, this.projectRoot] = [];
  },

  update(treeViewEl) {
    var entries = this.repository.getReferences().heads;
    this.branches.setEntries(entries);
    this.updateLocation(treeViewEl);
  },

  getProjectRoot(treeViewEl) {
    let projectPath = dirname(this.repository.getPath());
    return treeViewEl.querySelector(
      `[data-path^="${projectPath.replace(/\\/g, '\\\\')}"]`
    ).closest('.project-root');
  },

  getFirstProjectRoot(treeViewEl) {
    return treeViewEl.querySelector('.project-root');
  },

  getFirstDirectoryEl() {
    return this.projectRoot.querySelector('[is="tree-view-directory"]');
  },

  insertBefore(el) {
    el.parentNode.insertBefore(this.branches, el);
  },

  updateLocation(treeViewEl) {
    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'top':
      this.insertBefore(this.getFirstProjectRoot(treeViewEl));
      break;
    case 'before':
      this.insertBefore(this.projectRoot);
      break;
    case 'inside':
      this.insertBefore(this.getFirstDirectoryEl());
      break;
    }
  },

  setSeparator(show) {
    var addOrRemove = show && atom.config.get('tree-view-git-branch.separator') ? 'add' : 'remove';
    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'top':
      this.branches.classList.remove('separator');
      this.projectRoot.classList.remove('separator');
      break;
    case 'before':
      this.branches.classList[addOrRemove]('separator');
      this.projectRoot.classList.remove('separator');
      break;
    case 'inside':
      this.projectRoot.classList[addOrRemove]('separator');
      this.branches.classList.remove('separator');
      break;
    }
  },
};

export default function makeTreeViewGitRepository(...args) {
  var obj = Object.create(repositoryProto);
  obj.initialize(...args);
  return obj;
}
