psql "dbname='dbname' user='user' password='password' host='host'" -f db/schema.sql
cd abyss/
npm install
npm run build
cd ../server/
npm install
npm run start
