CREATE  TRIGGER triggername AFTER INSERT ON database.table FOR EACH ROW
BEGIN
  declare answer varchar(255);
  set answer = http_put('localhost:8027/trigger','weather');
END;