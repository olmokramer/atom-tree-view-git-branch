'use babel';
import gitBranchList from './git-branch-list.js';

var prototype = {
  initialize(repository, projectRootEl) {
    this.repository = repository;
    this.createElements(projectRootEl);
  },

  createElements(projectRootEl) {
    var references = this.repository.getReferences();
    this.locals = gitBranchList();
    this.locals.initialize({
      repository: this.repository,
      icon: 'git-branch',
      title: 'local branches',
      entries: references.heads,
    });
    projectRootEl.parentNode.insertBefore(this.locals, projectRootEl);
    this.remotes = gitBranchList();
    this.remotes.initialize({
      repository: this.repository,
      icon: 'git-branch',
      title: 'remote branches',
      entries: references.remotes,
    });
    projectRootEl.parentNode.insertBefore(this.remotes, projectRootEl);
    this.tags = gitBranchList();
    this.tags.initialize({
      repository: this.repository,
      icon: 'tag',
      title: 'tags',
      entries: references.tags,
    });
    projectRootEl.parentNode.insertBefore(this.tags, projectRootEl);
  },

  destroy() {
    this.locals.destroy();
    this.remotes.destroy();
    this.tags.destroy();
    [ this.locals, this.remotes, this.tags, this.repository ] = [];
  },
};

export default function gitRepository(...args) {
  var gitRepository = Object.create(prototype);
  if(args.length) gitRepository.initialize(...args);
  return gitRepository;
}
