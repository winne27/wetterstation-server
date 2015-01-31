<?php
try
{
   header('Access-Control-Allow-Origin: *');
   include_once("../funktionen.php");
   include_once("../dbpdo.php");

   //$sql = "start transaction";
   //$stmt = $db->query($sql);

   $sql = "SELECT * from weather order by datetime desc limit 1";
   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);

   $row['wind_gust'] = round($row['wind_gust'] * 3.6,0);
   $row['wind_speed'] = round($row['wind_speed'] * 3.6,0);
   $row['rel_pressure'] = round($row['rel_pressure'],0);

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
   $Sunrise     = date_sunrise(time());
   $Sunset      = date_sunset(time());
   //$output['values']['Sunriseset']  = $Sunrise . ' - ' . $Sunset;

   $sql = "SELECT power from em1010_readings where dnr = 3 order by datetime desc limit 0,1";
   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);

   $power = $row['power'];
   //$output['power'] = $power;
   $output['values']['Power'] = str_replace('.',',',round($power,1));
   $output['values']['SonnenProzent'] = round(100 * $row['power'] / 7.1,0);
   $output['special']['sonnenBreite'] = round(312 * $row['power'] / 7.1,0);
   $output['special']['sonnenProzent'] = round(100 * $row['power'] / 7.1,0);
}
catch (Exception $e)
{
   error_log('Akt ' . $sql);
   header("HTTP/1.0 903 invalid post parameter");
   exit;
}
echo json_encode($output);
?>