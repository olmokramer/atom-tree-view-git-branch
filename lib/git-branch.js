'use babel';
import createGitBranchView from './git-branch-view.js';

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
      let gitBranchView = views.get(repository);
      gitBranchView.destroy();
      views.delete(repository);
    }

    for(let repository of diff(repositories, views.keys())) {
      let gitBranchView = createGitBranchView();
      gitBranchView.initialize(repository);
      views.set(repository, gitBranchView);
      let projectRootEl = getProjectRootEl(treeViewEl.querySelector(`[data-path="${repository.getPath()}"]`));
      projectRootEl.parentNode.insertBefore(gitBranchView.el, projectRootEl);
    }
  }).catch(function error(err) {
    console.error(err.message, err.stack);
  });
}

function getProjectRootEl(el) {
  while(!el.classList.contains('project-root')) el = el.parentNode;
  return el;
}

function diff(arr1, arr2) {
  arr1 = iteratorToArray(arr1);
  arr2 = iteratorToArray(arr2);
  var result = [];
  for(let val of arr1) {
    if(arr2.indexOf(val) == -1) result.push(val);
  }
  return result;
}

function iteratorToArray(iterator) {
  if(iterator instanceof Array) return iterator;
  var result = [];
  for(let value of iterator) {
    result.push(value);
  }
  return result;
}
