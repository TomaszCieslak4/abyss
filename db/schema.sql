--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE hardScore;
DROP TABLE mediumScore;
DROP TABLE easyScore;
DROP TABLE ftduser;
CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	difficulty VARCHAR(6) NOT NULL
);

CREATE TABLE easyScore (
	username VARCHAR(20) PRIMARY KEY references ftduser(username),
	score INT NOT NULL
);
CREATE TABLE mediumScore (
	username VARCHAR(20) PRIMARY KEY references ftduser(username),
	score INT NOT NULL
);
CREATE TABLE hardScore (
	username VARCHAR(20) PRIMARY KEY references ftduser(username),
	score INT NOT NULL
);
--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'), 'easy');
INSERT INTO ftduser VALUES('user2', sha512('password2'), 'easy');
INSERT INTO easyScore VALUES('user1', 0);
INSERT INTO mediumScore VALUES('user1', 0);
INSERT INTO hardScore VALUES('user1', 0);
INSERT INTO easyScore VALUES('user2', 0);
INSERT INTO mediumScore VALUES('user2', 0);
INSERT INTO hardScore VALUES('user2', 0);
