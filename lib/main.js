'use babel';
import {dirname} from 'path';
import {CompositeDisposable} from 'atom';
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

// maps repositories to their respective view
var treeViewGitRepositories = new Map();

function update() {
  Promise.resolve(
    atom.packages.isPackageLoaded('tree-view') &&
    atom.packages.activatePackage('tree-view')
  ).then(treeViewPkg => {
    // do nothing if the tree view packages isn't loaded
    if(!treeViewPkg) return;

    var treeView = treeViewPkg.mainModule.createView();
    var treeViewEl = atom.views.getView(treeView);
    var repositories = atom.project.getRepositories();

    // remove old repositories
    for(let repository of treeViewGitRepositories.keys()) {
      // don't remove a repo that's still open
      if(repositories.indexOf(repository) > -1) continue;

      treeViewGitRepositories.get(repository).destroy();
      treeViewGitRepositories.delete(repository);
    }

    // update already tracked repositories and add new ones
    for(let repository of repositories) {
      // skip if project root isn't a git repository
      if(!repository) continue;

      if(treeViewGitRepositories.has(repository)) {
        treeViewGitRepositories.get(repository).update();
      } else {
        let projectPath = dirname(repository.getPath());
        let projectRootEl = getProjectRootEl(treeViewEl, projectPath);
        treeViewGitRepositories.set(
          repository, treeViewGitRepository(repository, projectRootEl)
        );
      }
    }
  }).catch(error => console.error(error.message, error.stack));
}

function getProjectRootEl(treeViewEl, path) {
  var el = treeViewEl.querySelector(`[data-path^="${path.replace(/\\/g, '\\\\')}"]`);
  while(!el.classList.contains('project-root')) el = el.parentNode;
  return el;
}
