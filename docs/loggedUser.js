export class LoggedUser {
    constructor() {
        this.userName = '';
    }
    setUser(newUser) {
        this.userName = newUser;
    }
    getUser() {
        return this.userName;
    }
}
