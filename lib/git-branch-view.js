'use babel';

var prototype = {
  initialize(repository) {
    this.repository = repository;
    this.createElement();
    this.createListItems();
  },

  destroy() {
    this.repository = null;
    this.parentNode.removeChild(this.el);
  },

  createElement() {
    this.el = this.createNestedList('git branches/tags', {
      className: 'git-branch',
      icon: 'circuit-board'
    });

    this.local = this.createNestedList('local branches');
    this.el.querySelector('ol').appendChild(this.local);

    this.remote = this.createNestedList('remote branches', {
      className: 'collapsed'
    });
    this.el.querySelector('ol').appendChild(this.remote);

    this.tags = this.createNestedList('tags', {
      className: 'collapsed'
    });
    this.el.querySelector('ol').appendChild(this.tags);
  },

  createListItems() {
    var { heads, remotes, tags } = this.repository.getReferences();
    for(let head of heads) {
      this.local.querySelector('ol').appendChild(this.createNestedListItem(head, {
        icon: 'git-branch'
      }));
    }
    for(let remote of remotes) {
      this.remote.querySelector('ol').appendChild(this.createNestedListItem(remote, {
        icon: 'git-branch'
      }));
    }
    for(let tag of tags) {
      this.tags.querySelector('ol').appendChild(this.createNestedListItem(tag, {
        icon: 'tag'
      }));
    }
  },

  createNestedList(title, { className, icon } = {}) {
    var nestedList = document.createElement('li');
    nestedList.classList.add('list-nested-item', 'entry', 'directory');
    if(className) nestedList.classList.add(className);

    var header = document.createElement('div');
    header.classList.add('header', 'list-item');

    var headerTitle = document.createElement('span');
    headerTitle.classList.add('name');
    if(icon) headerTitle.classList.add('icon', `icon-${ icon }`);
    headerTitle.innerHTML = title;

    var list = document.createElement('ol');
    list.classList.add('list-tree', 'entries');

    nestedList.appendChild(header);
    header.appendChild(headerTitle);
    nestedList.appendChild(list);
    return nestedList;
  },

  createNestedListItem(title, { icon }) {
    var listItem = document.createElement('li');
    listItem.classList.add('list-item', 'entry');

    var itemTitle = document.createElement('span');
    itemTitle.classList.add('name');
    if(icon) itemTitle.classList.add('icon', `icon-${icon}`);
    itemTitle.innerHTML = title;

    listItem.appendChild(itemTitle);
    return listItem;
  }
};

export default function() {
  return Object.create(prototype);
}
