'use babel';
import treeViewGitBranchList from './tree-view-git-branch-list.js';

var prototype = {
  initialize(repository, projectRootEl) {
    this.repository = repository;
    this.createElements(projectRootEl);
  },

  createElements(projectRootEl) {
    var { heads, remotes, tags } = this.repository.getReferences();
    this.locals = treeViewGitBranchList();
    this.locals.initialize({
      repository: this.repository,
      icon: 'git-branch',
      title: 'local branches',
      entries: heads,
    });
    projectRootEl.parentNode.insertBefore(this.locals, projectRootEl);
    // this.remotes = treeViewGitBranchList();
    // this.remotes.initialize({
    //   repository: this.repository,
    //   icon: 'git-branch',
    //   title: 'remote branches',
    //   entries: remotes,
    // });
    // projectRootEl.parentNode.insertBefore(this.remotes, projectRootEl);
    // this.tags = treeViewGitBranchList();
    // this.tags.initialize({
    //   repository: this.repository,
    //   icon: 'tag',
    //   title: 'tags',
    //   entries: tags,
    // });
    // projectRootEl.parentNode.insertBefore(this.tags, projectRootEl);
  },

  destroy() {
    this.locals.destroy();
    this.locals.parentNode.removeChild(this.locals);
    [ this.locals, this.repository ] = [];
    // this.remotes.destroy();
    // this.tags.destroy();
    // [ this.locals, this.remotes, this.tags, this.repository ] = [];
  },

  update() {
    var { heads, remotes, tags } = this.repository.getReferences();
    this.locals.setEntries(heads);
    // this.remotes.setEntries(remotes);
    // this.tags.setEntries(tags);
  },
};

export default function treeViewGitRepository(...args) {
  var treeViewGitRepository = Object.create(prototype);
  if(args.length) treeViewGitRepository.initialize(...args);
  return treeViewGitRepository;
}
