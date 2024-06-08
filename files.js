const usrs = require('./users');
const src = require('./basics');


class FileInterface {
    loadSources() {

    }

    loadUsers() {

    }

    saveSources() {

    }

    saveUsers() {

    }
}


class FilesJSON extends FileInterface {
    constructor() {
        super();
        this.fs = require('fs');
    }

    loadSources() {
        let data = this.fs.readFileSync('files/sources.json');
        data = JSON.parse(data);
        let res = [];

        for (let i of data) {
            let source = new src.Source(...i);
            res.push(source);
        }

        return res;
    }

    loadUsers() {
        let data = this.fs.readFileSync('files/users.json');
        data = JSON.parse(data);
        let res = [];

        for (let i of data) {
            let user;
            if (i.role == 'designer') {
                user = new usrs.Designer(i.id, i.name, i.pas, i.sourcesIdList);
            }
            else if (i.role == 'journalist') {
                user = new usrs.Journalist(i.id, i.name, i.pas, i.sourcesIdList);
            }
            else if (i.role == 'verstalshik') {
                user = new usrs.Verstak(i.id, i.name, i.pas, i.sourcesIdList);
            }
            else if (i.role == 'redactor') {
                user = new usrs.Redactor(i.id, i.name, i.pas);
            }

            res.push(user);
        }

        return res;
    }

    saveSources(sources) {
        let res = [];
        
        for (let i of sources) {
            res.push(i.getArr());
        }

        this.fs.writeFileSync('files/sources.json', JSON.stringify(res));
    }

    saveUsers(users) {
        let res = [];

        for (let i of users) {
            let obj = {
                'id': i.id,
                'name': i.name,
                'pas': i._password
            }

            if (i instanceof usrs.Designer) {
                obj.role = 'designer';
                obj.sourcesIdList = i._sourcesIdList;
            }
            else if (i instanceof usrs.Journalist) {
                obj.role = 'journalist';
                obj.sourcesIdList = i._sourcesIdList;
            }
            else if (i instanceof usrs.Redactor) {
                obj.role = 'redactor';
            }
            else if (i instanceof usrs.Verstak) {
                obj.role = 'verstalshik';
                obj.sourcesIdList = i._sourcesIdList;
            }

            res.push(obj);
        }

        this.fs.writeFileSync('files/users.json', JSON.stringify(res));
    }
}

module.exports = {FilesJSON}