'use babel';
import {basename, dirname} from 'path';
import {CompositeDisposable} from 'atom';
import makeTreeViewGitBranchList from './tree-view-git-branch-list.js';
import {addEventListener, insertBefore} from './utils.js';

var repositoryProto = {
  initialize(repository, treeViewEl) {
    this.repository = repository;
    this.branches = makeTreeViewGitBranchList({
      repository: repository,
      icon: 'git-branch',
      title: `branches [${basename(dirname(repository.getPath()))}]`,
    });

    this.update(treeViewEl);
  },

  destroy() {
    this.branches.destroy();
    if (this.disposables) {
      this.disposables.dispose();
    }
    [this.branches, this.disposables, this.repository] = [];
  },

  update(treeViewEl) {
    var nextSibling;

    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'top':
      nextSibling = this.getFirstProjectRootEl(treeViewEl);
      break;
    case 'before':
      nextSibling = this.getProjectRootEl(treeViewEl);
      break;
    case 'inside':
      let projectRootEl = this.getProjectRootEl(treeViewEl);
      nextSibling = this.getFirstDirectoryEl(projectRootEl);

      if (!this.disposables) {
        this.disposables = new CompositeDisposable(
          addEventListener(projectRootEl, 'click', () =>
            process.nextTick(() => {
              if (!projectRootEl.classList.contains('collapsed')) {
                nextSibling = this.getFirstDirectoryEl(projectRootEl);
                insertBefore(this.branches, nextSibling);
              }
            })
          ),

          atom.commands.add(treeViewEl, {
            'tree-view:expand-item': () => {
              nextSibling = this.getFirstDirectoryEl(projectRootEl);
              insertBefore(this.branches, nextSibling);
            },
            'tree-view:expand-recursive-directory': () => {
              nextSibling = this.getFirstDirectoryEl(projectRootEl);
              insertBefore(this.branches, nextSibling);
            },
          })
        );
      }
      break;
    }
    insertBefore(this.branches, nextSibling);

    this.branches.setEntries(this.repository.getReferences().heads);
  },

  getProjectRootEl(treeViewEl) {
    let projectPath = dirname(this.repository.getPath());
    return treeViewEl.querySelector(
      `[data-path^="${projectPath.replace(/\\/g, '\\\\')}"]`
    ).closest('.project-root');
  },

  getFirstProjectRootEl(treeViewEl) {
    return treeViewEl.querySelector('[is="tree-view-directory"]');
  },

  getFirstDirectoryEl(projectRootEl) {
    return projectRootEl.querySelector('[is="tree-view-directory"]');
  },

  setSeparator(show) {
    if (show && atom.config.get('tree-view-git-branch.separator') &&
        atom.config.get('tree-view-git-branch.location') == 'before') {
      this.branches.classList.add('separator');
    } else {
      this.branches.classList.remove('separator');
    }
  },
};

export default function makeTreeViewGitRepository(...args) {
  var obj = Object.create(repositoryProto);
  obj.initialize(...args);
  return obj;
}
