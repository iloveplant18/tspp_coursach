const users = require('./users');
const sources = require('./basics');


class BusinessLogic {
    _sources;
    _users;

    constructor(user, sources, usersList) {
        this._sources = sources;
        this._users = usersList;

        if (user instanceof users.Redactor) {
            this.actions = [1, 2, 3, 4, 5, 6];
        }
        else if (user instanceof users.Designer) {
            this.actions = [];
        }
        else if (user instanceof users.Journalst) {
            this.actions = [];
        }
    }

    getSources() {
        return this._sources;
    }

    getUsers() {
        return this._users;
    }

    addSource(source) {
        let srcId = source.id;
        
        for (let i of this._sources) {
            if (i.id == srcId) {
                return 0;
            }
        }

        this._sources.push(source);
        return 1;
    }

    delSource(id) {
        for (let i of this._sources) {
            if (i.id == id) {
                let index = this._sources.indexOf(i);
                this._sources.splice(index, 1);
                
                return 1;
            }
        }

        return 0;
    }

    giveSourceAccess(userId, sourceId) {
        for (let i of this._users) {
            if (i.id == userId) {
                return i.addSource(sourceId);
            }
        }
        
        return 0;
    }

    resetSourceAccess(userId, sourceId) {
        for (let i of this._users) {
            if (i.id == userId) {
                return i.delSource(sourceId);
            }
        }
        
        return 0;
    }

    addUser(user) {
        this._users.push(user);
    }

    delUser(userId) {
        for (let i of this._users) {
            if (i.id == userId) {
                let index = this._users.indexOf(i);
                this._users.splice(index, 1);
                
                return 1;
            }
        }

        return 0;
    }

    setSourceName(sourceId, name) {
        for (let i of this._sources) {
            if (i.id == sourceId) {
                i.name = name;
                return 1;
            }
        }

        return 0;
    }
    
    setSourceTask(sourceId, task) {
        for (let i of this._sources) {
            if (i.id == sourceId) {
                i.task = task;
                return 1;
            }
        }

        return 0;
    }
    
    setSourceInterview(sourceId, interview) {
        for (let i of this._sources) {
            if (i.id == sourceId) {
                i.interview = interview;
                return 1;
            }
        }

        return 0;
    }
    
    setSourceOpinion(sourceId, opinion) {
        for (let i of this._sources) {
            if (i.id == sourceId) {
                i.opinion = opinion;
                return 1;
            }
        }

        return 0;
    }
    
    setSourcePhoto(sourceId, photo) {
        for (let i of this._sources) {
            if (i.id == sourceId) {
                i.photo = photo;
                return 1;
            }
        }

        return 0;
    }
}


class UserPossibilities {
    _user;
    actions;
    
    constructor(user) {
        this._user = user;

        
    }

    

}




// let srcs = [];

// for (let i = 0; i < 10; i++) {
//     let source = new sources.Source(i, 'istochnik');
//     srcs.push(source);
// }

// let usrs = [];

// for (let i = 0; i < 10; i++) {
//     let user = new users.Designer(i, `User${i}`);
//     usrs.push(user);
// }

// let bl = new BusinessLogic(srcs, usrs);
// bl.setSourceTask(5, 'Story1')

// bl.giveSourceAccess(4, 8);

// bl.resetSourceAccess(4, 8);

// console.log(JSON.stringify(bl.getUsers()));
