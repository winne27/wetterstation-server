<?php
header('Access-Control-Allow-Origin: *');
try
{
   include_once("../funktionen.php");
   include_once("../dbpdo.php");

   $sql = "start transaction";
   $stmt = $db->query($sql);


  if (array_key_exists('datum',$_POST) && $_POST['datum'] != '')
  {
     $dateString = str_replace('-','',$_POST['datum']) . '01';
  }
  else
  {
     $dateString = 'heute';
  }

  if ($dateString == 'heute')
  {
     $dateString = date('Ymd');
  }


  if ($dateString < '20090600') $dateString = '20090601';

  $monat = substr($dateString,4,2);
  $jahr  = substr($dateString,0,4);

  $monthValue = $jahr . '-' . $monat;
  $nextmonthExist = ($monthValue == date('Y-m')) ? false : true;

  if ($monat == '01')
  {
     $vorMonat = ($jahr - 1) . '-12';
  }
  else
  {
     $vorMonat = $jahr . '-' . str_pad(($monat - 1),2,'0',STR_PAD_LEFT);
  }

  if ($monat == '12')
  {
     $folgeMonat = ($jahr + 1) . '-01';
  }
  else
  {
     $folgeMonat = $jahr . '-' . str_pad(($monat + 1),2,'0',STR_PAD_LEFT);
  }

  $timeStamp  = mktime(0, 0, 0, substr($dateString,4,2)  , 1, substr($dateString,0,4));
  $anzTage = date("t",$timeStamp);
  $output['special']['anzTage'] = $anzTage;
  $aktuell = date('Ymd');
  $iMax = (substr($aktuell,0,6) == substr($dateString,0,6)) ? date('j') : $anzTage;
  $monatString = substr($dateString,0,6);
  $jahr = substr($dateString,0,4);
  $monat1 = substr($dateString,4,2);

  $aktJahr  = substr($aktuell,0,4);
  $aktMonat = substr($aktuell,4,2);
  $aktTag   = substr($aktuell,6,2);
  $gestern  = str_pad($aktTag - 1,2,'0',STR_PAD_LEFT);

  $minTimestamp   = $monatString . '01';
  $maxTimestamp   = $monatString . '31';

  $maxTimestamp2 = ($aktJahr . $aktMonat == $monatString) ? $monatString . $gestern : $maxTimestamp;

  $sql = "SELECT min(temp_out_min) minTempOut,
                 max(temp_out_max) maxTempOut,
                 min(rel_hum_out_min) minRelHumOut,
                 max(rel_hum_out_max) maxRelHumOut,
                 round(max(wind_speed_max) * 3.6) maxWindSpeed,
                 min(rel_pressure_min) minRelPressure,
                 max(rel_pressure_max) maxRelPressure,
                 sum(rain) rainTotal
          from weather_daily_compressed where date >= '$minTimestamp' and date <= '$maxTimestamp'";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);

  array_walk($row,'punkt2komma');
  extract($row);

  $sql = "SELECT round(avg(temp_out),1) tdurch from weather
          where datetime >= '" . $minTimestamp . "000000' and datetime <= '" . $maxTimestamp . "235959'
          ";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $tdurch = $row['tdurch'];
  punkt2komma($tdurch);

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp2'
          and temp_out_max <= 0";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $eistage = $row['anzahl'];

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp'
          and temp_out_min <= 0";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $frosttage = $row['anzahl'];

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp2'
          and temp_out_min >= 20";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $tropennacht = $row['anzahl'];

  if ($monatString . $aktTag == $aktuell && date('G') > 7)
  {
      $sql = "select min(temp_out) mintemp from weather where datetime >= " . $aktuell . "000000 and datetime <= " . $aktuell . "080000";
      $stmt = $db->query($sql);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);
      if ($row['mintemp'] >= 20) $tropennacht++;
  }

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp'
          and temp_out_max >= 25";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $sommertage = $row['anzahl'];

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp'
          and temp_out_max >= 30";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $heissetage = $row['anzahl'];
  $sommertage = $sommertage - $heissetage;

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp2'
          and temp_out_avg < 15";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $heiztage = $row['anzahl'];

  $sql = "SELECT count(*) anzahl from weather_daily_compressed
          where date >= '$minTimestamp' and date <= '$maxTimestamp2'
          and temp_out_avg < 12";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
  $heiztage0 = $row['anzahl'];

  if ($monatString >= '201002')
  {
     $sql = "SELECT sum(delta_energy) sunTotal
             from em1010_readings_daily where dnr = 3 and date >= '$minTimestamp' and date <= '$maxTimestamp'";

      $stmt = $db->query($sql);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);

     $sql = "SELECT sum(value) adjustment
             from em1010_adjustment where dnr = 3 and date >= '$minTimestamp' and date <= '$maxTimestamp'";

     $stmt = $db->query($sql);
     if ($row2 = $stmt->fetch(PDO::FETCH_ASSOC))
     {
        $delta = $row2['adjustment'];
     }
     else
     {
        $delta = 0;
     }

     $sunTotal = round($row['sunTotal'] + $delta,1);
     punkt2komma($sunTotal);
  }
  else
  {
     $sunTotal = 'k.A.';
  }

  $output['points']['tempOutMin'] = array();
  $output['points']['tempOutMax'] = array();
  $output['points']['tempOutAvg'] = array();
  $output['points']['relHumOutMin'] = array();
  $output['points']['relPressureMin'] = array();
  $output['points']['relHumOutMax'] = array();
  $output['points']['relPressureMax'] = array();
  $output['points']['windSpeedMax'] = array();
  $output['points']['windangle1'] = array();
  $output['points']['windangle2'] = array();
  $output['points']['windangle3'] = array();
  $output['points']['rain'] = array();
  $output['points']['sunPower'] = array();

  for ($i = 1; $i <= $iMax; $i++)
  {
     $vonTimestamp = $monatString . str_pad($i,2,'0',STR_PAD_LEFT) . '000000';
     $bisTimestamp = $monatString . str_pad($i,2,'0',STR_PAD_LEFT) . '235959';

     $tag = $monatString . str_pad($i,2,'0',STR_PAD_LEFT);

     $sql = "SELECT temp_out_min minTempOut,
                    temp_out_max maxTempOut,
                    temp_out_avg avgTempOut,
                    rel_hum_out_min minRelHumOut,
                    rel_hum_out_max maxRelHumOut,
                    wind_speed_max maxWindSpeed,
                    rel_pressure_min minRelPressure,
                    rel_pressure_max maxRelPressure,
                    rain rainTotal
             from weather_daily_compressed where date = '$tag'";
      $stmt = $db->query($sql);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);

     $output['points']['tempOutMin'][] = array($i,$row['minTempOut']);
     $output['points']['tempOutAvg'][] = array($i,$row['avgTempOut']);
     $output['points']['relHumOutMin'][] = array($i,$row['minRelHumOut']);
     $output['points']['relPressureMin'][] = array($i,round($row['minRelPressure']));
     $output['points']['tempOutMax'][] = array($i,$row['maxTempOut']);
     $output['points']['relHumOutMax'][] = array($i,$row['maxRelHumOut']);
     $output['points']['relPressureMax'][] = array($i,round($row['maxRelPressure']));
     $output['points']['windSpeedMax'][] = array($i,$row['maxWindSpeed'] * 3.6);
     if ($row['rainTotal'] > 0)
     {
        $output['points']['rain'][] = array($i,$row['rainTotal']);
     }
   }
   $sunPower = array();
   if ($monatString >= '201002')
   {
      $sql = "select date_format(date,'%e') tag, delta_energy from em1010_readings_daily
              where dnr = 3 and date_format(date,'%Y%m') = '$monatString'";
      $stmt = $db->query($sql);
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $sunPower[$row['tag']] = $row['delta_energy'];
      }

      $sql = "SELECT date_format(date,'%e') tag, value adjustment
              from em1010_adjustment where dnr = 3 and date_format(date,'%Y%m') = '$monatString'";
      $stmt = $db->query($sql);
      while ($row2 = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $sunPower[$row2['tag']] += $row2['adjustment'];
      }
   }

   foreach ($sunPower as $tag => $power)
   {
      $output['points']['sunPower'][] = array($tag,$power);
   }

   for ($i = 1; $i <= $iMax; $i++)
   {
      $tag = $monatString . str_pad($i,2,'0',STR_PAD_LEFT);

      $sql = "select wind_angle, sum(counter) summe
                from weather_wind_counter
               where date = '" . $tag . "'
                 and wind_speed > 0
               group by wind_angle
               order by summe desc";

      $j = 1;
      $stmt = $db->query($sql);
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $output['points']['windangle' . $j][] = array($i,$row['wind_angle']);
         $j++;
         if ($j > 3) break;
      }
   }

   $output['values']['TempMin'] = $minTempOut;
   $output['values']['TempMax'] = $maxTempOut;
   $output['values']['TempDurch'] = $tdurch;
   $output['values']['HumMin'] = $minRelHumOut;
   $output['values']['HumMax'] = $maxRelHumOut;
   $output['values']['PressMin'] = round(str_replace(',','.',$minRelPressure));
   $output['values']['PressMax'] = round(str_replace(',','.',$maxRelPressure));
   $output['values']['WindMax'] = $maxWindSpeed;
   $output['values']['RainTotal'] = round(str_replace(',','.',$rainTotal));
   $output['values']['SunTotal'] = round(str_replace(',','.',$sunTotal));
   $output['values']['Eistage'] = $eistage;
   $output['values']['Frosttage'] = $frosttage;
   $output['values']['Heiztage12'] = $heiztage0;
   $output['values']['Heiztage15'] = $heiztage;
   $output['values']['Sommertage'] = $sommertage;
   $output['values']['Heissetage'] = $heissetage;
   $output['values']['Tropennacht'] = $tropennacht;
   $output['special']['Datum'] = $monthValue;
}
catch (Exception $e)
{
   error_log('Monat ' . $sql);
   header("HTTP/1.0 903 invalid post parameter");
   exit;
}
echo json_encode($output);
?>