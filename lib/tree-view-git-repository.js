'use babel';
import {basename, dirname} from 'path';
import {CompositeDisposable} from 'atom';
import makeTreeViewGitBranchList from './tree-view-git-branch-list.js';
import {addEventListener} from './utils.js';

var repositoryProto = {
  initialize(repository, treeView) {
    this.repository = repository;
    this.treeView = treeView;
    this.treeViewView = atom.views.getView(treeView);
    this.projectRoot = this.getProjectRoot(this.treeViewView);
    this.branches = makeTreeViewGitBranchList({
      repository: repository,
      icon: 'git-branch',
      title: `branches [${basename(dirname(repository.getPath()))}]`,
    });

    this.updateEntries();
    this.updateLocation();
    this.updateSeparator();
    this.subscribeToEvents();
  },

  subscribeToEvents() {
    this.disposables = new CompositeDisposable(
      atom.commands.add(this.branches, 'tree-view-git-branch:reload', (event) => {
        event.stopPropagation();
        this.updateEntries();
      }),

      atom.commands.add('atom-workspace', 'tree-view-git-branch:reload', () =>
        this.updateEntries()
      ),

      this.repository.onDidChangeStatus(() =>
        this.updateEntries()
      ),

      this.repository.onDidChangeStatuses(() =>
        this.updateEntries()
      ),

      addEventListener(this.projectRoot, 'click', event => {
        if (event.target.closest('li') == this.projectRoot) {
          this.updateLocation();
        }
      }),

      atom.commands.add(this.treeViewView, {
        ['tree-view:expand-item']() {
          this.updateLocation();
        },
        ['tree-view:expand-recursive-directory']() {
          this.updateLocation();
        },
      }),

      atom.config.observe('tree-view-git-branch.location', () => {
        this.updateLocation();
        this.updateSeparator();
      }),

      atom.config.observe('tree-view-git-branch.separator', newValue =>
        this.updateSeparator(newValue)
      )
    );
  },

  destroy() {
    this.branches.destroy();
    this.disposables.dispose();
  },

  updateEntries() {
    var entries = this.repository.getReferences().heads;
    this.branches.setEntries(entries);
  },

  getProjectRoot() {
    let projectPath = dirname(this.repository.getPath());
    return this.treeViewView.querySelector(
      `[data-path^="${projectPath.replace(/\\/g, '\\\\')}"]`
    ).closest('.project-root');
  },

  getFirstProjectRoot() {
    return this.treeViewView.querySelector('.project-root');
  },

  getFirstDirectoryEl() {
    return this.projectRoot.querySelector('[is="tree-view-directory"]');
  },

  insertBefore(el) {
    el.parentNode.insertBefore(this.branches, el);
  },

  updateLocation() {
    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'top':
      this.insertBefore(this.getFirstProjectRoot());
      break;
    case 'before':
      this.insertBefore(this.projectRoot);
      break;
    case 'inside':
      this.insertBefore(this.getFirstDirectoryEl());
      break;
    }
  },

  updateSeparator(show = atom.config.get('tree-view-git-branch.separator')) {
    var sep;

    this.branches.classList.remove('separator');
    this.projectRoot.classList.remove('separator');

    if (!show) {
      return;
    }

    switch (atom.config.get('tree-view-git-branch.location')) {
    case 'before':
      sep = this.branches;
      break;
    case 'inside':
      sep = this.projectRoot;
      break;
    }

    if (sep != null && sep != this.treeView.list[0].children[0]) {
      sep.classList.add('separator');
    }
  },
};

export default function makeTreeViewGitRepository(...args) {
  var obj = Object.create(repositoryProto);
  obj.initialize(...args);
  return obj;
}
