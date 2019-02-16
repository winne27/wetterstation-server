--- Backup vom Master

mysqldump -u root -p$(cat /etc/mysql.shadow) wetterstation > wetterstation.sql
gzip wetterstation.sql
scp wetterstation.sql.gz @eins:/root

--- auf slave einspielen
gunzip wetterstation.sql.gz
mysql -u wetterstation -p$(cat /etc/mysql.shadow.wetterstation) wetterstation < wetterstation.sql
12gf_z65vG757#
--- auf dem Master: show master status;

stop slave;

CHANGE MASTER TO
     MASTER_HOST='10.8.0.22',
     MASTER_USER='repl',
     MASTER_PASSWORD='fehn10#',
     MASTER_LOG_FILE='mysql-bin.000061',
     MASTER_LOG_POS=337671;

start slave;