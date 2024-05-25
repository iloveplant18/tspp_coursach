

class Source {
    id;
    name;
    task;
    interview;
    opinion;
    photo;

    constructor(id, name, task, interview, opinion, photo) {
        this.id = id;
        this.name = name;
        this.task = task;
        this.interview = interview;
        this.opinion = opinion;
        this.photo = photo;
    }

    getArr() {
        return [this.id, this.name, this.task, this.interview, this.opinion, this.photo];
    }
}


module.exports = {Source};