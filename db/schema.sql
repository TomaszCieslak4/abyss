--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS ftduser CASCADE;

CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY NOT NULL,
	password BYTEA NOT NULL,
	difficulty VARCHAR(6) NOT NULL
);

CREATE TABLE scores (
	username VARCHAR(20) PRIMARY KEY NOT NULL,
	lastScore INT NOT NULL,
	highScore INT NOT NULL,
	FOREIGN KEY (username) references ftduser(username) ON DELETE CASCADE
);

--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'), 'noobie');
INSERT INTO ftduser VALUES('user2', sha512('password2'), 'noobie');
INSERT INTO scores VALUES('user1', 0, 0);
INSERT INTO scores VALUES('user2', 0, 0);
