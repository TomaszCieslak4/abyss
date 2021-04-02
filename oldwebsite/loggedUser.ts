export class LoggedUser {
    // Store the password (not ideal)... but other methods are out of scope
    private static username: string;
    private static password: string;
    private static difficulty: string;

    public static setUser(newUsername: string) {
        LoggedUser.username = newUsername;
    }

    public static getUser() {
        return LoggedUser.username;
    }

    public static setDifficulty(newDifficulty: string) {
        LoggedUser.difficulty = newDifficulty;
    }

    public static getDifficulty() {
        return LoggedUser.difficulty;
    }

    public static setPassword(password: string) {
        LoggedUser.password = password;
    }

    public static getPassword() {
        return LoggedUser.password;
    }
}
