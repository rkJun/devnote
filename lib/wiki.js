var gitfs = require('./gitfs');
var _ = require('underscore');
var ghm = require('github-flavored-markdown');
var hl = require('highlight');

function init(callback) {
    gitfs.init(callback);
}

function writePage(name, content, callback) {
    var files = {};

    files[name+""] = content;
    var commit = {
        files: files,
        author: {name: 'Guest', mail: 'guest@n4wiki.com', timezone: '+0900'},
        committer: {name: 'Guest', mail: 'guest@n4wiki.com', timezone: '+0900'},
        message: 'Edit ' + name
    };

    gitfs.commit(commit, callback);
}

function getPage(name, callback) {
    gitfs.show(name, function(err, buffer) {
        if (err) callback(err);
        else callback(err, buffer.toString());
    });
}

function deletePage(name, callback){
    var files = {};
    var treeId;

    var unixtime = Math.round(new Date().getTime() / 1000);

    var preparedCommit = {
        files: files,
        author: 'Guest <guest@n4wiki.com> ' + unixtime + ' +0900',
        committer: 'Guest <guest@n4wiki.com> ' + unixtime + ' +0900',
        message: 'delete ' + name
    };

    gitfs.getHeadCommit(function(err, commit) {
        treeId = commit.tree;
        gitfs.readObject(treeId, function(err, tree) {
            delete tree[name];
            gitfs._createCommitFromTree(preparedCommit, tree, function (err, commitId) {
                gitfs.getHeadTree(callback);
            })
        });
    });
}

function render(content) {
    // Syntax highlight
    content = content.replace(/```\w+((\r|\n|.)*?)(\r|\n)```/gm, function(match, p1) {
        return '<pre>' + (hl.Highlight(p1)) + '</pre>';
    });

    // markdown rendering
    return ghm.parse(content);
}

exports.deletePage = deletePage;
exports.writePage = writePage;
exports.getPage = getPage;
exports.init = init;
exports.render = render;