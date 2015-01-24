--- erst Backup vom Master einspielen

mysqldump -u root -p wetterstation > wetterstation.sql
gzip wetterstation.sql
scp wetterstation.sql.gz @eins:/root
mysql -u wetterstation -p wetterstation < wetterstation.sql
12gf_z65vG757#
--- auf dem Master: show master status;

CHANGE MASTER TO
     MASTER_HOST='10.8.0.22',
     MASTER_USER='repl',
     MASTER_PASSWORD='fehn10#',
     MASTER_LOG_FILE='mysql-bin.000001',
     MASTER_LOG_POS=107;

create slave;