'use babel';
import {CompositeDisposable} from 'atom';
import treeViewGitRepository from './tree-view-git-repository.js';

/* eslint-disable vars-on-top */
export var config = {
  location: {
    description: 'location of the items in the tree view.  top: all at the top of the tree view. before-project: before the corresponding project directory, this is the default.',
    type: 'string',
    default: 'before-project',
    enum: [
      'top',
      'before-project',
    ],
  },
};

var disposables;

// maps repositories to their respective view
var treeViewGitRepositories = new Map();
/* eslint-enable vars-on-top */

function update() {
  // resolves with the tree view package
  // object if and when it is loaded, or
  // with false if it isn't
  Promise.resolve(
    atom.packages.isPackageLoaded('tree-view') &&
    atom.packages.activatePackage('tree-view')
  ).then(treeViewPkg => {
    var treeViewEl;

    // do nothing if the tree view packages isn't loaded
    if (!treeViewPkg) {
      atom.notifications.addError('tree-view package not loaded', {
        detail: 'tree-view-git-branch requires the tree view package to be loaded',
      });
      return;
    }

    treeViewEl = atom.views.getView(treeViewPkg.mainModule.createView());

    Promise.all(
      atom.project.getDirectories().map(
        atom.project.repositoryForDirectory.bind(atom.project)
      )
    ).then(repositories => {
      // remove old repositories
      for (let repository of treeViewGitRepositories.keys()) {
        if (repositories.indexOf(repository) == -1) {
          treeViewGitRepositories.get(repository).destroy();
          treeViewGitRepositories.delete(repository);
        }
      }

      // update already tracked repositories and add new ones
      for (let repository of repositories) {
        // skip if project root isn't a git repository
        if (!repository) {
          continue;
        }

        try {
          treeViewGitRepositories.get(repository).update(treeViewEl);
        } catch (e) {
          treeViewGitRepositories.set(
            repository, treeViewGitRepository(repository, treeViewEl)
          );
        }
      }
    });
  }).catch(error => console.error(error.message, error.stack));
}

export function activate() {
  disposables = new CompositeDisposable(
    atom.project.onDidChangePaths(update),

    atom.commands.add('atom-workspace', 'tree-view-git-branch:reload', update),

    atom.config.onDidChange('tree-view-git-branch.location', update)
  );
  update();
}

export function deactivate() {
  disposables.dispose();
  disposables = null;
}
