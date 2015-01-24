<?php
   include("../dbanmelden.php");

   $art = (array_key_exists('art',$_GET)) ? $_GET['art'] : 'online';

   $dateString = date('Ymd');
   $minTimestamp   = $dateString . '000000';
   $maxTimestamp   = $dateString . '235959';

   $sql = "SELECT rain from weather_daily_compressed where date = '$dateString'";
   $erg = mysql_query($sql,$verbindung);
   $row = mysql_fetch_array($erg,MYSQL_ASSOC);
   $rain = $row['rain'];

   $sql = "SELECT * from weather order by datetime desc limit 1";
   $erg = mysql_query($sql,$verbindung);
   $row = mysql_fetch_array($erg,MYSQL_ASSOC);

   $aktTimestamp   = $row['datetime'];
   $aktTempOut     = $row['temp_out'];
   $aktRelHumOut   = $row['rel_hum_out'];
   $aktWindSpeed   = $row['wind_speed'];
   $aktWindAngle   = $row['wind_angle'];
   $aktRelPressure = $row['rel_pressure'];

   $uhrzeit = substr($aktTimestamp,11,5);
   $datum = substr($aktTimestamp,8,2) . "." . substr($aktTimestamp,5,2) . "." . substr($aktTimestamp,0,4);

   switch($art)
   {
      case 'online':
         echo $aktTempOut . "\n";
         echo $aktRelHumOut . "\n";
         echo $aktRelPressure . "\n";
         echo $aktWindSpeed . "\n";
         echo $aktWindAngle . "\n";
         echo $uhrzeit . "\n";
         echo $datum . "\n";
         echo $rain . "\n";
      break;
      case '24':
         echo $aktTempOut . "\n";
         echo $aktRelHumOut . "\n";
         echo $aktRelPressure . "\n";
         echo $rain . "\n";
         echo $aktWindSpeed . "\n";
         echo $aktWindAngle . "\n";
         echo $uhrzeit . "\n";
         echo $datum . "\n";
      break;
   }


?>