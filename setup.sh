psql "dbname='dbname' user='user' password='password' host='host'" -f db/schema.sql
cd server/
npm install
cd ../abyss/
npm install