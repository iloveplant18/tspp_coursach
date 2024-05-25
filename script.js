const users = require('./users');
const sources = require('./basics');

const chalk = require('chalk');


// 0 - создать исходник
// 1 - изменить название исходника
// 2 - изменить таск (тз) исходника
// 3 - изменить интервью исходника
// 4 - изменить мнение журналиста у исходника
// 5 - изменить фото исходника
// 6 - удалить исходник
// 7 - нанять работника
// 8 - уволить работника
// 9 - назначить исзодник работнику


class BusinessLogic {
    _sources;
    _users; // список всех пользователей
    _user; // пользователь, который работаает в программе

    constructor(user, sources, usersList) {
        this._sources = sources;
        this._users = usersList;
        this._user = user;

        this._workers = [];
        for (let i of this._users) {
            if (!(i instanceof users.Redactor)) {
                this._workers.push(i);
            }
        }
    }

    getSources() {
        return this._sources;
    }

    getWorkers() {
        return this._workers;
    }

    addSource(source) {
        for (let i of this._sources) {
            if (i.id == source.id) {
                return 0;
            }
        }

        this._sources.push(source);
        return 1;
    }

    delSource(source) {
        let index = this._sources.indexOf(source);
        
        if (index != -1) {
            this._sources.splice(index, 1);

            for (let i of this._workers) {
                i.delSource(source.id);
            }
            
            return 1;
        }
        
        return 0;
    }

    giveSourceAccess(user, sourceId) {
        return user.addSource(sourceId);
    }

    resetSourceAccess(user, sourceId) {
        return user.delSource(sourceId);
    }

    addUser(user) {
        for (let i of this._users) {
            if (i.id == user.id) {
                return 0;
            }
        }

        this._users.push(user);
        return 1;
    }

    delUser(user) {
        let index = this._users.indexOf(user);
        
        if (index != -1) {
            this._users.splice(index, 1);

            if (!(user instanceof users.Redactor)) {
                index = this._workers.indexOf(user);
                this._workers.splice(index, 1);
            }

            return 1;
        }
        
        return 0;
    }

    setSourceName(source, name) {
        source.name = name;
        return 1;
    }
    
    setSourceTask(source, task) {
        source.task = task;
        return 1;
    }
    
    setSourceInterview(source, interview) {
        source.interview = interview;
        return 1;
    }
    
    setSourceOpinion(source, opinion) {
        source.opinion = opinion;
        return 1;
    }
    
    setSourcePhoto(source, photo) {
        source.photo = photo;
        return 1;
    }
}


class ConsoleOutput {
    constructor(users) {
        this._users = users;
        this.prompt = require('prompt-sync')();

        this.keyObj = {}

        let readline = require('readline');
        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true);

        process.stdin.on('keypress', (data, key) => this.keyObj[key.name]?.());
    }

    // запуск процесса авторизации
    authorization() {
        let name = this.prompt("Enter your name: ");
        let password = this.prompt("Enter your password: ");

        let success = false;
        let i;

        for (i of this._users) {
            if ((i.name == name) && (i.getPassword() == password)) {
                success = true;
                break;
            }
        }

        if (!success) {
            console.clear();
            console.log('Incorrect name or password, try again');
            this.authorization();
            return;
        }

        this._user = i;

        this.getUserType();

        // здесь создаем исходники, потом надо будет считывать из файла
        let srcs = [];

        for (let i = 0; i < 10; i++) {
            let source = new sources.Source(i, 'istochnik');
            srcs.push(source);
        }
        // дальше нормальный код

        this.bl = new BusinessLogic(i, srcs, this._users);

        this.createMenu();

        this.start();
    }

    getUserType() {
        console.log(this._user);

        if (this._user instanceof users.Redactor) {
            this.userType = 'redactor';
        }
        else if (this._user instanceof users.Journalist) {
            this.userType = 'journalist';
        }
        else if (this._user instanceof users.Designer) {
            this.userType = 'designer';
        }

        console.log(this.userType);
    }

    // запуск стартового меню
    start() {
        this.currentItem = 0;

        let sources = this.bl.getSources();

        console.clear();
        this.printMenu(this.actionsArr);

        this.keyObj = {
            'up': () => {
                if (this.currentItem == 0) return;

                this.currentItem--;
                console.clear();
                this.printMenu(this.actionsArr);
            },
            'down': () => {
                if (this.currentItem == this.actionsArr.length - 1) return;

                this.currentItem++;
                console.clear();
                this.printMenu(this.actionsArr);
            },
            'return': () => {
                let item = this.actionsArr[this.currentItem];
                
                if (item == 'Работа с исходниками') {
                    let table = this.bl.getSources();
                    let description = 'Enter - редактирование\ndelete - удаление';
                    let header = 'id  name  task  interview  opinion  photo';
            
                    this.currentTableName = 'sources';

                    this.prepareActions();
                    this.showTable(table, description, header);
                }
                else if (item == 'Работа с сотрудниками') {
                    let table = this.bl.getWorkers();
                    let description = 'Enter - редактирование\ndelete - удаление';
                    let header = 'id  name  password  sources_list';

                    this.currentTableName = 'users';
            
                    this.prepareActions();
                    this.showTable(table, description, header);
                }
            },
            'escape': () => {
                console.clear();
                process.exit(1);
            }
        }
    }

    prepareActions(tableName) {
        let redactableColsObj = {
            'sources': {
                'redactor': [1, 2, 3, 4, 5],
                'journalist': [3, 4],
                'designer': [5]
            },
            'users': {
                'redactor': []
            }
        }

        this.redactableColumns = redactableColsObj[this.currentTableName][this.userType];
    }

    // Запуск просмотра какой-либо таблицы
    showTable(table, description, header) {
        console.clear();
        this.currentItem = 0;
        this.currentColumn = 0;

        this.printTable(table, header, description);

        this.keyObj = {
            'up': () => {
                if (this.currentItem == 0) return;

                this.currentItem--;
                console.clear();
                this.printTable(table, header, description);
            },
            'down': () => {
                if (this.currentItem == table.length - 1) return;

                this.currentItem++;
                console.clear();
                this.printTable(table, header, description);
            },
            'left': () => {
                if (this.currentColumn == 0) return;

                this.currentColumn--;
                console.clear();
                this.printTable(table, header, description);
            },
            'right': () => {
                if (this.currentColumn == table[0]?.getArr().length - 1) return;

                this.currentColumn++;
                console.clear();
                this.printTable(table, header, description);
            },
            'return': () => {
                if (this.redactableColumns.includes(this.currentColumn)) {
                    this.changeData(table);
                }
            },
            'delete': () => {
                if (this.currentTableName == 'sources') {
                    this.bl.delSource(table[this.currentItem]);
                    table = this.bl.getSources();
                }
                else if (this.currentTableName == 'users') {
                    this.bl.delUser(table[this.currentItem]);
                    table = this.bl.getWorkers();
                }

                if (this.currentItem != 0) this.currentItem--;

                console.clear();
                this.printTable(table, header, description);
            },
            'escape': () => {
                console.clear();
                this.start();
            }
        }
    }

    // отрисовка таблицы
    printTable(table, header, description) {
        if (description) {
            console.log(description);
        }

        if (header) {
            console.log(header);
        }

        for (let i = 0; i < table.length; i++) {
            if (this.currentItem == i) {
                console.log(this.createRow(table[i].getArr(), 1));
                continue;
            }

            console.log(this.createRow(table[i].getArr()));
        }
    }

    // создание строки таблицы для отрисовки
    createRow(row, colorRow) {
        let res = '';

        for (let i = 0; i < row.length; i++) {
            if (colorRow && this.currentColumn == i) {
                if (this.redactableColumns.includes(this.currentColumn)) {
                    res += chalk.bgGreen(row[i]) + ' ';
                }
                else {
                    res += chalk.bgRed(row[i]) + ' ';
                }
                continue;
            }

            res += row[i] + ' ';
        }

        return res;
    }

    // создание главного меню с действиями
    createMenu() {
        if (this.userType == 'redactor') {
            this.actionsArr = ['Работа с исходниками', 'Работа с сотрудниками'];
        }
        else {
            this.actionsArr = ['Работа с исходниками'];
        }
    }

    // вывод любого меню
    printMenu(menu) {
        for (let i of menu) {
            if (this.currentItem == menu.indexOf(i)) {
                console.log((chalk.underline(chalk.red(i))));
                continue;
            }

            console.log(i);
        }
    }

    changeData(table) {
        console.log(`Старое значение ячейки: ${table[this.currentItem].getArr()[this.currentColumn]}`);
        let newData = this.prompt('Введите новое значение ячейки: ');

        let item = table[this.currentItem];

        let obj = {
            'sources': {
                1: () => this.bl.setSourceName(item, newData),
                2: () => this.bl.setSourceTask(item, newData),
                3: () => this.bl.setSourceInterview(item, newData),
                4: () => this.bl.setSourceOpinion(item, newData),
                5: () => this.bl.setSourcePhoto(item, newData),
            },
            'users': {  

            }
        }

        if (obj[this.currentTableName][this.currentColumn]()) {
            console.log('Значение обновлено хаха (используй стрелочки чтобы обновить таблицу)');
            return;
        }

        console.log('Чета не так браточек');
        return;
    }
}




let srcs = [];

for (let i = 0; i < 10; i++) {
    let source = new sources.Source(i, 'istochnik');
    srcs.push(source);
}

let usrs = [];

for (let i = 0; i < 10; i++) {
    let user = new users.Designer(i, `User${i}`, '111', [5]);
    usrs.push(user);
}

for (let i = 11; i < 20; i++) {
    let user = new users.Journalist(i, `Jr${i}`, '333');
    usrs.push(user);
}

let redactor = new users.Redactor(10, 'mr. Redactor', '222');
usrs.push(redactor);

let bl = new BusinessLogic(usrs[1], srcs, usrs);
bl.setSourceTask(srcs[0], 'Story1')

bl.giveSourceAccess(usrs[4], 8);
bl.resetSourceAccess(usrs[4], 8);

// console.log(JSON.stringify(bl.getWorkers()));



let session = new ConsoleOutput(usrs);

session.authorization();
