<?php
   header('Access-Control-Allow-Origin: *');
   include_once("../funktionen.php");
   include_once("../dbpdo.php");
   $sql = "SELECT * from weather order by datetime desc limit 1";
   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);

   $row['wind_gust'] = round($row['wind_gust'] * 3.6,0);
   $row['wind_speed'] = round($row['wind_speed'] * 3.6,0);
   $row['RelPressure'] = round($row['RelPressure'],0);

   array_walk($row,'punkt2komma');

   $output['values']['Timestamp']   = substr($row['datetime'],11);
   $output['values']['TempOut']     = $row['temp_out'];
   $output['values']['RelHumOut']   = $row['rel_hum_out'];
   $output['values']['Dewpoint']    = $row['dewpoint'];
   $output['values']['WindSpeed']   = $row['wind_speed'];
   $output['values']['WindGust']    = $row['wind_gust'];
   $output['values']['WindDir']     = str_replace('E','O',$row['wind_direction']);
   $output['values']['WindChill']   = $row['wind_chill'];
   $output['values']['RelPressure'] = $row['rel_pressure'];
   $output['special']['Forcast']    = 'img/' . $row['forecast'] . '.jpg';
   $output['values']['Rain1h']      = $row['rain_1h'];
   $output['values']['Rain24h']     = $row['rain_24h'];
   $output['values']['DateString']  = '';

   $sql = "SELECT power from em1010_readings where dnr = 3 order by datetime desc limit 0,1";
   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);

   $power = $row['power'];
   //$output['power'] = $power;
   $output['values']['aktPower'] = str_replace('.',',',round($power,1));
   $output['special']['sonnenBreite'] = round(284 * $row['power'] / 7,0);
   echo json_encode($output);
?>