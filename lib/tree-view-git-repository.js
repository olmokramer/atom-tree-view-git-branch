'use babel';
import {basename, dirname} from 'path';
import makeTreeViewGitBranchList from './tree-view-git-branch-list.js';
import {insertBefore} from './utils.js';

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
    [this.branches, this.repository] = [];
  },

  update(treeViewEl) {
    this.branches.setEntries(this.repository.getReferences().heads);

    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'before-project':
      insertBefore(this.branches, this.getProjectRootEl(treeViewEl));
      break;
    case 'top':
      insertBefore(this.branches, this.getFirstProjectRootEl(treeViewEl));
      break;
    }
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

  setSeparator(show) {
    if (show && atom.config.get('tree-view-git-branch.separator') &&
        atom.config.get('tree-view-git-branch.location') == 'before-project') {
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
