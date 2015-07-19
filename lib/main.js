'use babel';
import 'array.from';

import gitRepository from './git-repository.js';

var disposable;

export function activate() {
  disposable = atom.project.onDidChangePaths(update);
  update();
}

export function deactivate() {
  disposable.dispose();
  disposable = null;
}

var views = new Map();

function update() {
  Promise.resolve(
    atom.packages.isPackageLoaded('tree-view') &&
    atom.packages.activatePackage('tree-view')
  ).then(function didActivateTreeView(treeViewPkg) {
    if(!treeViewPkg) return;
    var treeView = treeViewPkg.mainModule.createView();
    var treeViewEl = atom.views.getView(treeView);
    var repositories = atom.project.getRepositories();

    for(let repository of diff(views.keys(), repositories)) {
      let gitRepository = views.get(repository);
      gitRepository.destroy();
      views.delete(repository);
    }

    for(let repository of diff(repositories, views.keys())) {
      let projectRootEl = getProjectRootEl(treeViewEl, repository.getPath());
      views.set(repository, gitRepository(repository, projectRootEl));
    }
  }).catch(function error(err) {
    console.error(err.message, err.stack);
  });
}

function getProjectRootEl(treeViewEl, path) {
  var el = treeViewEl.querySelector(`[data-path="${path}"]`);
  while(!el.classList.contains('project-root')) el = el.parentNode;
  return el;
}

// returns arr1 without the items that are
// found in arr2
function diff(arr1, arr2) {
  arr2 = Array.from(arr2);
  return Array.from(arr1).filter((item) => arr2.indexOf(item) == -1);
}
