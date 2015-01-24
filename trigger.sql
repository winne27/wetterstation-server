CREATE TRIGGER wetterstation.tr_weather_a AFTER INSERT ON wetterstation.weather FOR EACH ROW
BEGIN
  set @tt_resu = sys_exec('wget -q -O - http://localhost:8027/trigger >/dev/null 2>&1');
END;