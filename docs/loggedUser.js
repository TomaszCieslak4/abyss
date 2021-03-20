export class LoggedUser {
    static setUser(newUsername) {
        LoggedUser.username = newUsername;
    }
    static getUser() {
        return LoggedUser.username;
    }
    static setDifficulty(newDifficulty) {
        LoggedUser.difficulty = newDifficulty;
    }
    static getDifficulty() {
        return LoggedUser.difficulty;
    }
    static setPassword(password) {
        LoggedUser.password = password;
    }
    static getPassword() {
        return LoggedUser.password;
    }
}
