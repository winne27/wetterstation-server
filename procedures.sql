DROP PROCEDURE IF EXISTS wetterstation.dailyrain;
CREATE PROCEDURE wetterstation.dailyrain()
BEGIN
      declare v_schalter int(1);
      SELECT case when date(datetime) = date(sysdate()) then 0 else 1  end as schalter into v_schalter FROM weather_last_upload where flag = 'dailyrain';
      if v_schalter then
         update weather_daily_compressed set rain = (select rain_24h from weather where date(datetime) >= curdate() order by datetime asc limit 0,1) where date = curdate() - interval 1 day;
         update weather_last_upload set datetime = SYSDATE() where flag = 'dailyrain';
      end if;
      call windcount('');
END;

DROP PROCEDURE IF EXISTS wetterstation.windcount;
CREATE PROCEDURE wetterstation.windcount(datum varchar(10))
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE v_speed decimal(4,1);
  DECLARE v_speed_rounded tinyint;
  DECLARE v_angle decimal(4,1);
  DECLARE v_count tinyint;

  DECLARE c1 CURSOR FOR SELECT wind_speed, wind_angle FROM wetterstation.weather where date(datetime) = datum;
  DECLARE c2 CURSOR FOR SELECT count(*) FROM wetterstation.weather_wind_counter where date = datum and wind_speed = v_speed_rounded and wind_angle = v_angle;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  if datum = '' then
    set datum = date(sysdate());
  end if;

  delete from wetterstation.weather_wind_counter where date = datum;
  insert into wetterstation.weather_wind_counter values (datum, 0, 0, 0);

  open c1;
  fetch c1 into v_speed, v_angle;
  while !done do
    if v_speed < 0.5 then
      update wetterstation.weather_wind_counter set counter = counter + 1 where date = datum and wind_speed = 0;
    else

      set v_speed_rounded = round(v_speed);
      open c2;
      fetch c2 into v_count;
      close c2;
      if v_count = 0 then
        insert wetterstation.weather_wind_counter values (datum, v_speed_rounded, v_angle, 1);
      else
        update wetterstation.weather_wind_counter set counter = counter + 1 where date = datum and wind_speed = v_speed_rounded and wind_angle = v_angle;
      end if;
    end if;
    fetch c1 into v_speed, v_angle;
  end while;

  close c1;
END;

