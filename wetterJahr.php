<?php
header('Access-Control-Allow-Origin: *');
try
{
   $debug = false;

   include_once("../funktionen.php");
   include_once("../dbpdo.php");

   $sql = "start transaction";
   $stmt = $db->query($sql);

   if (isset($jahr))
   {
      $ajaxcall = false;
   }
   else if (array_key_exists('datum',$_POST) && $_POST['datum'] != '')
   {
      $jahr = $_POST['datum'];
      $ajaxcall = true;
   }
   else
   {
      $ajaxcall = true;
      $jahr = date('Y');
   }

   if (!is_numeric($jahr)) throw new exception();

   if ($jahr < '2009') $jahr = '2009';

   $iMax = (date('Y') == $jahr) ? date('m') : 12;

   $aktuell = date('Ymd');
   $aktJahr  = substr($aktuell,0,4);
   $aktMonat = substr($aktuell,4,2);
   $aktTag   = substr($aktuell,6,2);
   $gestern  = str_pad($aktTag - 1,2,'0',STR_PAD_LEFT);

   for ($i = 2009;$i <= $aktJahr;$i++)
   {
      $selected[$i] = ($i == $jahr) ? ' selected="selected"' : '';
   }

   $iMin = ($jahr == 2009) ? 6 : 1;

   $minTimestamp   = $jahr . '0101';
   $maxTimestamp   = $jahr . '1231';

   $maxTimestamp2 = ($aktJahr == $jahr) ? $aktJahr . $aktMonat . $gestern : $maxTimestamp;
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

   $datax = array("Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez");

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

   if ($jahr . $aktMonat . $aktTag == $aktuell && date('G') > 7)
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

   $sql = "SELECT round(avg(temp_out),1) tdurch from weather
          where datetime >= '" . $minTimestamp . "000000' and datetime <= '" . $maxTimestamp . "235959'
          ";

   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
   $tdurch = $row['tdurch'];
   punkt2komma($tdurch);

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

   $output['points']['tempOutMin']     = array();
   $output['points']['tempOutMax']     = array();
   $output['points']['tempOutAvg']     = array();
   $output['points']['relHumOutMin']   = array();
   $output['points']['relPressureMin'] = array();
   $output['points']['relHumOutMax']   = array();
   $output['points']['relPressureMax'] = array();
   $output['points']['windSpeedMax']   = array();
   $output['points']['rain']           = array();
   $output['points']['sunPower']       = array();
   $output['points']['windangle1']     = array();
   $output['points']['windangle2']     = array();
   $output['points']['windangle3']     = array();

   for ($i = $iMin; $i <= $iMax; $i++)
   {
      $vonTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '01';
      $bisTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '31';

      $sql = "SELECT min(temp_out_min) minTempOut,
                    max(temp_out_max) maxTempOut,
                    avg(temp_out_avg) avgTempOut,
                    min(rel_hum_out_min) minRelHumOut,
                    max(rel_hum_out_max) maxRelHumOut,
                    max(wind_speed_max) maxWindSpeed,
                    min(rel_pressure_min) minRelPressure,
                    max(rel_pressure_max) maxRelPressure,
                    sum(rain) rainTotal
             from weather_daily_compressed where date >= '$vonTimestamp' and date <= '$bisTimestamp'";
      $stmt = $db->query($sql);
      $row = $stmt->fetch(PDO::FETCH_ASSOC);

      $output['points']['tempOutMin'][] = array($i,$row['minTempOut']);
      $output['points']['tempOutAvg'][] = array($i,$row['avgTempOut']);
      $output['points']['relHumOutMin'][] = array($i,$row['minRelHumOut']);
      $output['points']['relPressureMin'][] = array($i,$row['minRelPressure']);
      $output['points']['tempOutMax'][] = array($i,$row['maxTempOut']);
      $output['points']['relHumOutMax'][] = array($i,$row['maxRelHumOut']);
      $output['points']['relPressureMax'][] = array($i,$row['maxRelPressure']);
      $output['points']['windSpeedMax'][] = array($i,$row['maxWindSpeed'] * 3.6);
      if ($row['rainTotal'] > 0)
      {
         $output['points']['rain'][] = array($i,$row['rainTotal']);
      }
   }

   for ($i = $iMin; $i <= $iMax; $i++)
   {
      $vonTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '01';
      $bisTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '31';

      $sql = "select sum(delta_energy) summe from em1010_readings_daily
              where dnr = 3 and date >= '$vonTimestamp' and date <= '$bisTimestamp'";
      $stmt = $db->query($sql);
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $sunPower[$i] = round($row['summe'],0);
      }

      $sql = "SELECT value adjustment
              from em1010_adjustment where dnr = 3 and date >= '$vonTimestamp' and date <= '$bisTimestamp'";
      $stmt = $db->query($sql);
      while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $sunPower[$i] += round($row['adjustment'],0);
      }
   }

   foreach ($sunPower as $monat => $power)
   {
      $output['points']['sunPower'][] = array($monat,$power);
   }

   for ($i = $iMin; $i <= $iMax; $i++)
   {
      $vonTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '01';
      $bisTimestamp = $jahr . str_pad($i,2,'0',STR_PAD_LEFT) . '31';
      $sql = "select wind_angle, sum(counter) summe
                from weather_wind_counter
               where date >= '" . $vonTimestamp . "'
                 and date <= '" . $bisTimestamp . "'
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
   $output['special']['Datum'] = $jahr;

}
catch (Exception $e)
{
   error_log('Jahr ' . $sql);
   header("HTTP/1.0 903 invalid post parameter");
   exit;
}
if ($ajaxcall) echo json_encode($output);
?>