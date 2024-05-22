

class User {
    name;
    id;
    _password;

    constructor(id, name, pas) {
        this.id = id;
        this.name = name;
        this._password = pas;
    }
}

class Redactor extends User {
    constructor(id, name, pas) {
        super(id, name, pas);
    }
}

class Worker extends User {
    _sourcesIdList;

    constructor(id, name, pas, sourcesIdList) {
        super(id, name, pas);
        this._sourcesIdList = sourcesIdList ?? [];
    }

    addSource(sourceId) {
        if (sourceId in this._sourcesIdList) return 0;

        this._sourcesIdList.push(sourceId);
        return 1;
    }

    delSource(sourceId) {
        let index = this._sourcesIdList.indexOf(sourceId);

        if (index == -1) return 0;

        this._sourcesIdList.splice(index, 1);
        return 1;
    }

    getSourcesId() {
        return this._sourcesIdList;
    }
}

class Designer extends Worker {
    constructor(id, name, pas, sourcesIdList) {
        super(id, name, pas, sourcesIdList);
    }    
}

class Journalst extends Worker {
    constructor(id, name, pas, sourcesIdList) {
        super(id, name, pas, sourcesIdList);
    }    
}


module.exports = {Journalst, Designer, Redactor};
