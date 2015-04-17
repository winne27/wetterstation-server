<?php
   header('Access-Control-Allow-Origin: *');
   try
   {
      $output = array();
      include_once ("../funktionen.php");
      include_once ("../dbpdo.php");
      include_once("inc/php_moon_rise_set.php");
      include_once("inc/MoonPhase.php");
      date_default_timezone_set('Europe/Berlin');
      $sql = "start transaction";
      $stmt = $db->query($sql);
      if (array_key_exists('datum', $_POST) && $_POST['datum'] != '')
      {
         $dateString = $_POST['datum'];
      }
      else
      {
         $dateString = date('Y-m-d');
      }
      if ($dateString == date('Y-m-d'))
      {
         $aktStunde = date('G');
         $tomorrowExist = false;
      }
      else
      {
         $aktStunde = 23;
         $tomorrow = mktime(0, 0, 0, substr($dateString, 5, 2), substr($dateString, 8, 2) + 1, substr($dateString, 0, 4));
         $tomorrowString = date('Y-m-d', $tomorrow);
         $tomorrowDate = date('Ymd', $tomorrow) . '000000';
         $tomorrowExist = true;
      }
      $today = mktime(0, 0, 0, substr($dateString, 5, 2), substr($dateString, 8, 2), substr($dateString, 0, 4));
      $yesterday = mktime(0, 0, 0, substr($dateString, 5, 2), substr($dateString, 8, 2) - 1, substr($dateString, 0, 4));
      $yesterdayString = date('Y-m-d', $yesterday);
      $yesterdayDate = date('Ymd', $yesterday) . '000000';
      $dateAnzeige = substr($dateString, 8, 2) . "." . substr($dateString, 5, 2) . "." . substr($dateString, 0, 4);
      $dateDate = substr($dateString, 0, 4) . substr($dateString, 5, 2) . substr($dateString, 8, 2);
      $minTimestamp = $dateDate . '000000';
      $maxTimestamp = $dateDate . '235959';
      $sql = "SELECT temp_out_min minTempOut,
                 temp_out_max maxTempOut,
                 rel_hum_out_min minRelHumOut,
                 rel_hum_out_max maxRelHumOut,
                 round(wind_speed_max * 3.6) maxWindSpeed,
                 rel_pressure_min minRelPressure,
                 rel_pressure_max maxRelPressure,
                 rain rainTotal
          from weather_daily_compressed where date = '" . $dateDate . "'";
      $stmt = $db->query($sql);
      if ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $minDruck = $row['minRelPressure'];
         $maxDruck = $row['maxRelPressure'];
         if ($maxDruck - $minDruck < 5)
         {
            $minDruck = floor($minDruck - (5 - $maxDruck + $minDruck) / 2);
            $maxDruck = max($minDruck + 5, ceil($maxDruck));
            $ytick1 = 1;
            $ytick2 = 1;
         }
         else
         {
            $minDruck = 0;
            $maxDruck = 0;
            $ytick1 = 2;
            $ytick2 = 1;
         }
         array_walk($row, 'punkt2komma');
         extract($row);
         $sql = "SELECT round(avg(temp_out),1) tdurch from weather
             where datetime >= '" . $minTimestamp . "' and datetime <= '" . $maxTimestamp . "'
             ";
         $stmt = $db->query($sql);
         $row = $stmt->fetch(PDO::FETCH_ASSOC);
         $tdurch = $row['tdurch'];
         punkt2komma($tdurch);
// Sonnendaten
         if ($dateDate >= '20100201')
         {
            $sql = "SELECT delta_energy sunTotal
                 from em1010_readings_daily where dnr = 3 and date = '$dateDate'";
            $stmt = $db->query($sql);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $sql = "SELECT sum(value) adjustment
                 from em1010_adjustment where dnr = 3 and date = '$dateDate'";
            $stmt = $db->query($sql);
            if ($row2 = $stmt->fetch(PDO::FETCH_ASSOC))
            {
               $delta = $row2['adjustment'];
            }
            else
            {
               $delta = 0;
            }
            $sunTotal = round($row['sunTotal'] + $delta, 1);
            punkt2komma($sunTotal);
         }
         else
         {
            $sunTotal = 'k.A.';
         }
         $output['values']['TempMin'] = $minTempOut;
         $output['values']['TempMax'] = $maxTempOut;
         $output['values']['TempDurch'] = $tdurch;
         $output['values']['HumMin'] = $minRelHumOut;
         $output['values']['HumMax'] = $maxRelHumOut;
         $output['values']['PressMin'] = round(str_replace(',', '.', $minRelPressure));
         $output['values']['PressMax'] = round(str_replace(',', '.', $maxRelPressure));
         $output['values']['WindMax'] = $maxWindSpeed;
         $output['values']['RainTotal'] = $rainTotal;
         $output['values']['SunTotal'] = $sunTotal;
         $output['special']['Datum'] = $dateString;
         setlocale (LC_ALL, 'de_DE');
         $Sunrise = date_sunrise($today, SUNFUNCS_RET_STRING, 53.9, 7.57,90,1 + date('I'));
         $Sunset = date_sunset($today, SUNFUNCS_RET_STRING, 53.9, 7.57,90,1 + date('I'));
         $output['values']['Sunriseset'] = $Sunrise . ' - ' . $Sunset;

         $moon = Moon::calculateMoonTimes(substr($dateString, 5, 2), substr($dateString, 8, 2), substr($dateString, 0, 4), 53.9, 7.57);
         $output['values']['Moonrise'] = date('H:i', $moon->moonrise);
         $output['values']['Moonset'] = date('H:i', $moon->moonset);

         $jetzt = time();
         $moon = new Solaris\MoonPhase($jetzt);
         //$moon = new Solaris\MoonPhase(date());
         $nextNewMoon = ($moon->new_moon() > $jetzt) ?  $moon->new_moon() : $moon->next_new_moon();
         $nextFullMoon = ($moon->full_moon() > $jetzt) ?  $moon->full_moon() : $moon->next_full_moon();
         $output['values']['Nextnewmoon'] = date( 'j. M H:i:s', $nextNewMoon );
         $output['values']['Nextfullmoon'] = date( 'j. M. H:i:s', $nextFullMoon );

         $enMonths = array('Mar','May.','Oct','Dec');
         $deMonths = array('Mrz','Mai','Okt','Dez');

         $output['values']['Nextnewmoon'] = str_replace($enMonths,$deMonths,$output['values']['Nextnewmoon']);
         $output['values']['Nextfullmoon'] = str_replace($enMonths,$deMonths,$output['values']['Nextfullmoon']);
         
         $moonPhase = $moon->phase();


         if ($jetzt > $nextNewMoon || ($jetzt <= $nextFullMoon && $nextFullMoon < $nextNewMoon))
         {
            $tendenz = ' &uarr;';
         }
         else
         {
            $tendenz = ' &darr;';
         }
         /*
         if ($moonPhase == 0 || $moonPhase == 0.5 || $moonPhase == 1)
         {
            $tendenz = ' &uarr;';
         }
         else if ($moonPhase < 0.5)
         {
            $tendenz = ' &uarr;';
         }
         else
         {
            $tendenz = ' &darr;';
         }
         */
         $output['values']['Moonphase'] = round($moon->illumination() * 100,0) . '%' . $tendenz;


// Wetterdaten für Grafik
         $sql = "SELECT date_format(datetime,'%H') stunde, date_format(datetime,'%i') minute, date_format(datetime,'%H:%i') time,
                    temp_out, rel_hum_out,rel_pressure,wind_speed,wind_gust,wind_angle
                    from weather
                    where date(datetime) = date('$dateDate') order by datetime asc";
         $stmt = $db->query($sql);
         $output['points']['temperature'] = array();
         $output['points']['huminity'] = array();
         $output['points']['pressure'] = array();
         $output['points']['windspeed'] = array();
         $output['points']['windgust'] = array();
         $output['points']['windangle'] = array();
         $output['points']['sunpower'] = array();
         $output['points']['rain'] = array();
         $lastI = 0;
         $lastSpeedI = - 1;
         $lastNullSpeedI = - 1;
         $lastGustI = - 1;
         $lastNullGustI = - 1;
         while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
         {
            $i = round($row['stunde'] + $row['minute'] / 60, 2);
            $output['points']['temperature'][] = array($i, $row['temp_out']);
            $output['points']['huminity'][] = array($i, $row['rel_hum_out']);
            $output['points']['pressure'][] = array($i, $row['rel_pressure']);
            if ($row['wind_gust'] > 0)
            {
               $output['points']['windangle'][] = array($i, $row['wind_angle']);
            }
            if ($row['wind_speed'] > 0)
            {
               if ($lastSpeedI != $lastI && $lastNullSpeedI != $lastI)
               {
                  $output['points']['windspeed'][] = array($lastI, 0);
                  $lastNullSpeedI = $lastI;
               }
               $output['points']['windspeed'][] = array($i, $row['wind_speed'] * 3.6);
               $lastSpeedI = $i;
            }
            else
               if ($lastSpeedI == $lastI)
               {
                  $output['points']['windspeed'][] = array($i, 0);
                  $lastNullSpeedI = $i;
               }
               if ($row['wind_gust'] > 0)
               {
                  if ($lastGustI != $lastI && $lastNullGustI != $lastI)
                  {
                     $output['points']['windgust'][] = array($lastI, 0);
                     $lastNullGustI = $lastI;
                  }
                  $output['points']['windgust'][] = array($i, $row['wind_gust'] * 3.6);
                  $lastGustI = $i;
               }
               else
                  if ($lastGustI == $lastI)
                  {
                     $output['points']['windgust'][] = array($i, 0);
                     $lastNullGustI = $i;
                  }
                  $lastI = $i;
         }
// Sonnendaten für Grafik
         if ($dateString >= '20100201')
         {
            $sql = "SELECT date_format(datetime,'%H') stunde, date_format(datetime,'%i') minute, date_format(datetime,'%H:%i') time, power from em1010_readings where date(datetime) = date('$dateString') and dnr = 3 order by datetime asc";
            $stmt = $db->query($sql);
            $output['points']['sunpower'] = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
            {
               if ($row['power'] > 0)
               {
                  $output['points']['sunpower'][] = array(round($row['stunde'] + $row['minute'] / 60, 2), round(100 * $row['power'] / 7.1));
               }
            }
         }
// Regendaten für Grafik
         for ($i = 0; $i <= $aktStunde; $i++)
         {
            $iTimestamp = $dateDate . str_pad($i, 2, '0', STR_PAD_LEFT) . '0000';
            $jTimestamp = $dateDate . str_pad($i - 1, 2, '0', STR_PAD_LEFT) . '0000';
            $sql = "SELECT rain_1h from weather where datetime >= '$iTimestamp' order by datetime asc limit 1";
            $stmt = $db->query($sql);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($i > 0)
            {
               $j = $i - 1;
               if ($row['rain_1h'] > 0)
               {
                  $output['points']['rain'][] = array($j, $row['rain_1h']);
               }
            }
         }
         if ($dateDate != date('Ymd'))
         {
            $sql = "SELECT rain_1h from weather where datetime >= '$tomorrowDate' order by datetime asc limit 1";
            $stmt = $db->query($sql);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row['rain_1h'] > 0)
            {
               $output['rain'][] = array(23, $row['rain_1h']);
            }
         }
      }
      else
      {
         error_log('falsches Datum:' . $dateDate);
         throw new Exception();
      }
   }
   catch (Exception $e)
   {
      error_log('Tag ' . $sql);
      header("HTTP/1.0 903 invalid post parameter");
      exit;
   }
   echo json_encode($output);
?>