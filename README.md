# tree-view-git-branch package

List branches and tags of git projects in the tree view. Double click to `git checkout`.

![screenshot](https://raw.githubusercontent.com/olmokramer/atom-tree-view-git-branch/master/screenshot.png)

## Known issues

* Doesn't list remote branches and tags, because the [GitRepository](https://atom.io/docs/api/latest/GitRepository) currently doesn't do checkout for references other than local branches. This might change in the future, or another git library might be used in the future.
