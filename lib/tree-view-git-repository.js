'use babel';
import {basename, dirname} from 'path';
import treeViewGitBranchList from './tree-view-git-branch-list.js';
import {insertBefore} from './utils.js';

var repositoryProto = {
  initialize(repository, treeViewEl) {
    this.repository = repository;

    this.branches = treeViewGitBranchList({
      repository: this.repository,
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
    var {heads} = this.repository.getReferences();

    this.branches.setEntries(heads);

    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'before-project':
      insertBefore(this.branches, this.getProjectRootEl(treeViewEl));
      break;
    case 'top':
      insertBefore(this.branches, treeViewEl.querySelector('[is="tree-view-directory"]'));
      break;
    }
  },

  getProjectRootEl(treeViewEl) {
    let projectPath = dirname(this.repository.getPath());
    return treeViewEl.querySelector(
      `[data-path^="${projectPath.replace(/\\/g, '\\\\')}"]`
    ).closest('.project-root');
  },
};

export default function treeViewGitRepository(...args) {
  var obj = Object.create(repositoryProto);
  obj.initialize(...args);
  return obj;
}
