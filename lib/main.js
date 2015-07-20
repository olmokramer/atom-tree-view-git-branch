'use babel';
import { CompositeDisposable } from 'atom';

import treeViewGitRepository from './tree-view-git-repository.js';

var disposables;

export function activate() {
  disposables = new CompositeDisposable(
    atom.project.onDidChangePaths(update),
    atom.commands.add('atom-workspace', 'tree-view-git-branch:reload', update),
  );
  update();
}

export function deactivate() {
  disposables.dispose();
  disposables = null;
}

var treeViewGitRepositories = new Map();

function update() {
  Promise.resolve(
    atom.packages.isPackageLoaded('tree-view') &&
    atom.packages.activatePackage('tree-view')
  ).then(treeViewPkg => {
    if(!treeViewPkg) return;
    var treeView = treeViewPkg.mainModule.createView();
    var treeViewEl = atom.views.getView(treeView);
    var repositories = atom.project.getRepositories();

    // remove old repositories
    for(let repository of treeViewGitRepositories.keys()) {
      if(repositories.indexOf(repository) > -1) continue;
      treeViewGitRepositories.get(repository).destroy();
      treeViewGitRepositories.delete(repository);
    }

    // update existing repositories and add new ones
    for(let repository of repositories) {
      if(!repository) continue;
      if(treeViewGitRepositories.has(repository)) {
        treeViewGitRepositories.get(repository).update();
      } else {
        let projectRootEl = getProjectRootEl(treeViewEl, repository.getPath());
        treeViewGitRepositories.set(repository, treeViewGitRepository(repository, projectRootEl));
      }
    }
  }).catch(error => console.error(error.message, error.stack));
}

function getProjectRootEl(treeViewEl, path) {
  var el = treeViewEl.querySelector(`[data-path="${path}"]`);
  while(!el.classList.contains('project-root')) el = el.parentNode;
  return el;
}
