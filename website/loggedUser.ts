export class LoggedUser {
    private userName: string;

    constructor() {
        this.userName = '';
    }

    public setUser(newUser: string) {
        this.userName = newUser;
    }

    public getUser() {
        return this.userName;
    }
}
