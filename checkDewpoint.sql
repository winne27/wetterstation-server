use wetterstation;

select w.datetime, w.dewpoint, (select min(ws.temp_out) from weather ws where ws.datetime > w.datetime and ws.datetime < date_add(w.datetime, interval 1 day)) mintemp
from weather w
where date_format(w.datetime,'%H%i') >= '1700'
  and date_format(w.datetime,'%H%i') <= '1701'
  and date_format(w.datetime,'%m') > 8
  and w.dewpoint < 4 and dewpoint > 0
  order by w.dewpoint desc
;