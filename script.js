const users = require('./users');
const sources = require('./basics');
const saveLoad = require('./files');

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
        this.sortingById(this._users);
        this._user = user;

        this._workers = [];
        for (let i of this._users) {
            if (!(i instanceof users.Redactor)) {
                this._workers.push(i);
            }
        }

        this.saveLoad = new saveLoad.FilesJSON();
    }

    save() {
        this.saveLoad.saveSources(this._sources);
        this.saveLoad.saveUsers(this._users);
    }

    getSources() {
        return this._sources;
    }

    getWorkers() {
        return this._workers;
    }

    getUsers() {
        return this._users;
    }

    addSource(source) {
        for (let i of this._sources) {
            if (i.id == source.id) {
                return 0;
            }
        }

        this._sources.push(source);
        this.sortingById(this._sources);

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
        this.sortingById(this._users);

        if (!(user instanceof users.Redactor)) {
            this._workers.push(user);
            this.sortingById(this._workers);
        }

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

    sortingById(table) {
        for (let i = 0; i < table.length - 1; i++) {
            for (let j = 0; j < table.length - 1 - i; j++) {
                if (table[j].id > table[j + 1].id) {
                    let temp = table[j];
                    table[j] = table[j + 1];
                    table[j + 1] = temp;
                }
            }
        }
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
    constructor() {
        this.saveLoad = new saveLoad.FilesJSON();
        this._users = this.saveLoad.loadUsers();
        this._user = null;
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

        // считываем исходники
        let srcs = this.saveLoad.loadSources();

        this.bl = new BusinessLogic(i, srcs, this._users);
        this._users = this.bl.getUsers();

        this.createMenu();

        this.start();
    }

    getUserType() {
        if (this._user instanceof users.Redactor) {
            this.userType = 'redactor';
        }
        else if (this._user instanceof users.Journalist) {
            this.userType = 'journalist';
        }
        else if (this._user instanceof users.Designer) {
            this.userType = 'designer';
        }
        else if (this._user instanceof users.Verstak) {
            this.userType = 'verstalshik';
        }
    }

    // запуск стартового меню
    start() {
        this.currentItem = 0;

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
                    let description = 'Enter - редактирование';
                    if (this.userType == 'redactor') description += '\nn - добавление\ndelete - удаление';
                    let header = ['id',  'name', 'task', 'interview',  'opinion', 'photo'];
            
                    this.currentTableName = 'sources';

                    this.prepareActions();
                    this.showTable(table, description, header);
                }
                else if (item == 'Работа с сотрудниками') {
                    let table = this.bl.getWorkers();
                    let description = 'Enter - редактирование\ndelete - удаление\nn - добавление\na - назначить исходник\nd - удаление исходника';
                    let header = ['id',  'name',  'password',  'sources_list'];

                    this.currentTableName = 'users';

                    this.prepareActions();
                    this.showTable(table, description, header);
                }
            },
            'escape': () => {
                console.clear();
                this.bl.save();
                process.exit(1);
            }
        }
    }

    prepareActions() {
        let redactableColsObj = {
            'sources': {
                'redactor': [1, 2, 3, 4, 5],
                'journalist': [3, 4],
                'designer': [5],
                'verstalshik': [1, 2, 3, 4, 5],
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
            'escape': () => {
                console.clear();
                this.start();
            }
        }

        if (this.userType == 'redactor') {
            Object.assign(this.keyObj, {
                'n': () => {
                    this.addRow();    
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
            });

            if (this.currentTableName == 'users') {
                Object.assign(this.keyObj, {    
                    'a': () => {
                        let user = table[this.currentItem];
                        this.appointSource(user);
                    },
                    'd': () => {
                        let user = table[this.currentItem];
                        this.delSource(user);
                    }
                });
            }
        }
    }

    // назначаем исходник челу
    appointSource(user) {
        let id = this.prompt("Введите id источника для назначения его работнику");
        
        let sources = this.bl.getSources();
        for (let i of sources) {
            if (i.id == id) {
                if (user.addSource(id)) {
                    console.log("Источник добавлен успешно");
                    return;
                }

                console.log("Такой источник уже есть");
                return;
            }
        }

        console.log('Нет источника с таким id');
    }

    // удаляем исходник у чела
    delSource(user) {
        let id = this.prompt("Введите id источника для удаления его у работника");
        
        if (user.delSource(id)) {
            console.log('Удалено');
            return;
        }

        console.log('У работника нет источника с таким id. Как можно пытаться забрать то чего нет');
    }

    // добавление значения в списки пользователей/исходников
    addRow() {
        console.clear();
        let questions;
        let id;
        let table;

        console.log("Добавлениие элемента");

        if (this.currentTableName == 'sources') {
            questions = ['Введите название ', 'Введите задание '];
            table = this.bl.getSources();
        }
        else if (this.currentTableName == 'users') {
            questions = ['Введите имя ', 'Введите пароль '];
            table = this.bl.getUsers();
        }

        let answers = [];

        for (let i of questions) {
            let ans = this.prompt(i);
            answers.push(ans);
        }

        for (let i = 0; i <= table.length; i++) {
            if (table[i]?.id != i) {
                id = i;
                break;
            }
        }

        let resArr = ['неудачно', 'успешно'];

        if (this.currentTableName == 'sources') {
            let src = new sources.Source(id, ...answers);
            console.log(`Добавление завершилось ${resArr[this.bl.addSource(src)]}, нажмиете на стрелочку чтобы продолжить работу`);
        }
        else if (this.currentTableName == 'users') {
            let choiceMenu = ['1. Journalist', '2. Designer', '3. Redactor', '4. Verstalshik'];
            let choice,
            worker;

            do {
                choice = Number(this.choice(choiceMenu));
            }
            while (isNaN(Number(choice)) || Number(choice) > choiceMenu.length || Number(choice) < 1)

            switch (choice) {
                case 1:
                    worker = new users.Journalist(id, ...answers);
                    break;
                case 2:
                    worker = new users.Designer(id, ...answers);
                    break;
                case 3:
                    worker = new users.Redactor(id, ...answers);
                    break;
                case 4:
                    worker = new users.Verstak(id, ...answers);
                    break;
            }

            console.log(`Добавление завершилось ${resArr[this.bl.addUser(worker)]}, нажмиете на стрелочку чтобы продолжить работу`);
        }
    }

    // Выбор из нескольких позиций, возвращает полльзовательский ввод
    choice(menu) {
        let obj = this.keyObj;
        this.keyObj = {}; 

        this.currentItem = -1;
        this.printMenu(menu);

        let answ = this.prompt("Введите номер понравившегося варианта: ");

        this.keyObj = obj;

        return answ;
    }

    // отрисовка таблицы
    printTable(table, header, description) {
        if (description) {
            console.log(description);
        }

        this.countRowSpace(table, header);

        if (header) {
            let headerRow = '';

            for (let i = 0; i < header.length; i++) {
                let spacesNumber = this.spacing[i] - header[i].length + 1;
                headerRow += header[i] + ' '.repeat(spacesNumber);
            }

            console.log(headerRow);
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
            let spacesNumber = this.spacing[i] - String(row[i]).length + 1

            if (colorRow && this.currentColumn == i) {
                if (this.redactableColumns.includes(this.currentColumn)) {
                    res += chalk.bgGreen(row[i]) + ' '.repeat(spacesNumber);
                }
                else {
                    res += chalk.bgRed(row[i]) + ' '.repeat(spacesNumber);
                }

                continue;
            }

            res += row[i] + ' '.repeat(spacesNumber);
        }

        return res;
    }

    countRowSpace(table, header) {
        let res = [];

        for (let i = 0; i < header.length; i++) {
            res.push(String(header[i]).length);
        }
        
        for (let i of table) {
            let row = i.getArr()
            
            for (let j = 0; j < row.length; j++) {
                if (res[j] < String(row[j]).length)
                res[j] = String(row[j]).length;
            }
        }

        this.spacing = res;
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

for (let i = 0; i < 6; i++) {
    let user = new users.Designer(i, `User${i}`, '111', [5]);
    usrs.push(user);
}

for (let i = 11; i < 17; i++) {
    let user = new users.Journalist(i, `Jr${i}`, '333');
    usrs.push(user);
}

for (let i = 20; i < 27; i++) {
    let user = new users.Verstak(i, `Verstak${i}`, '444');
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