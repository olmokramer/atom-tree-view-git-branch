'use babel';
import {CompositeDisposable} from 'atom';
import makeTreeViewGitRepository from './tree-view-git-repository.js';

/* eslint-disable vars-on-top */
export var config = {
  location: {
    description: 'Location of the items in the tree view.<br>Top: all at the top of the tree view.<br>Before: before the corresponding project directory.<br>Inside: as the first item in the corresponding project directory, this is the default.',
    type: 'string',
    default: 'inside',
    enum: [
      'top',
      'before',
      'inside',
    ],
  },
  separator: {
    description: 'Draw a separator between a project and the next branch list. Does nothing when the "location" setting is "top".',
    type: 'boolean',
    default: false,
  },
};

var disposables;

// maps repositories to their respective view
var treeViewGitRepositories = new Map();
/* eslint-enable vars-on-top */

// remove old repositories
function removeOldRepositories(currentRepositories) {
  for (let repository of treeViewGitRepositories.keys()) {
    if (currentRepositories.indexOf(repository) == -1) {
      treeViewGitRepositories.get(repository).destroy();
      treeViewGitRepositories.delete(repository);
    }
  }
}

function insertNewRepositories(currentRepositories, treeView) {
  for (let repository of currentRepositories) {
    // skip if project root isn't a git repository
    // or if it is already in the list
    if (repository && !treeViewGitRepositories.has(repository)) {
      let treeViewGitRepository = makeTreeViewGitRepository(repository, treeView);
      treeViewGitRepositories.set(repository, treeViewGitRepository);
    }
  }
}

// update tracked repositories and add new ones
function updateRepositories(treeView) {
  Promise.all(atom.project.getDirectories().map(
    directory => atom.project.repositoryForDirectory(directory)
  )).then(repositories => {
    removeOldRepositories(repositories);
    insertNewRepositories(repositories, treeView);
  });
}

export function activate() {
  // resolves with the tree view package
  // object if and when it is loaded, or
  // with false if it isn't
  Promise.resolve(
    atom.packages.isPackageLoaded('tree-view') &&
    atom.packages.activatePackage('tree-view')
  ).then(treeViewPkg => {
    var treeView = treeViewPkg.mainModule.createView();

    // do nothing if the tree view packages isn't loaded
    if (!treeViewPkg) {
      atom.notifications.addError('tree-view package not loaded', {
        detail: 'tree-view-git-branch requires the tree view package to be loaded',
      });
      return;
    }

    disposables = new CompositeDisposable(
      atom.project.onDidChangePaths(() =>
        updateRepositories(treeView)
      )
    );

    updateRepositories(treeView);
  }).catch(error =>
    console.error(error.message, error.stack)
  );
}

export function deactivate() {
  disposables.dispose();
}
