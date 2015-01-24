<?php
header('Access-Control-Allow-Origin: *');
try
{
   $debug = false;

   include_once("../funktionen.php");
   include_once("../dbpdo.php");
   $sql = "start transaction";
   $stmt = $db->query($sql);

   $minJahr = 2010;
   $maxJahr = date('Y') - 1;
   $anzJahre = $maxJahr - $minJahr + 1;

   $werte['special']['Datum'] = $maxJahr;

   $werte['points']['tempOutMin']     = array();
   $werte['points']['tempOutMax']     = array();
   $werte['points']['tempOutAvg']     = array();
   $werte['points']['relHumOutMin']   = array();
   $werte['points']['relHumOutMax']   = array();
   $werte['points']['relPressureMin'] = array();
   $werte['points']['relPressureMax'] = array();
   $werte['points']['windSpeedMax']   = array();
   $werte['points']['rain']           = array();
   $werte['points']['sunPower']       = array();
   $werte['points']['windangle1']     = array();
   $werte['points']['windangle2']     = array();
   $werte['points']['windangle3']     = array();


   for ($jahr = $minJahr; $jahr <= $maxJahr; $jahr++)
   {
      include('wetterJahr.php');
      $work[$jahr] = $output['values'];
      $werte['points']['tempOutMin'][] = array($jahr,str_replace(',','.',$output['values']['TempMin']));
      $werte['points']['tempOutMax'][] = array($jahr,str_replace(',','.',$output['values']['TempMax']));
      $werte['points']['tempOutAvg'][] = array($jahr,str_replace(',','.',$output['values']['TempDurch']));
      $werte['points']['relHumOutMin'][] = array($jahr,$output['values']['HumMin']);
      $werte['points']['relHumOutMax'][] = array($jahr,$output['values']['HumMax']);
      $werte['points']['relPressureMin'][] = array($jahr,$output['values']['PressMin']);
      $werte['points']['relPressureMax'][] = array($jahr,$output['values']['PressMax']);
      $werte['points']['windSpeedMax'][]   = array($jahr,$output['values']['WindMax']);
      $werte['points']['rain'][]           = array($jahr,$output['values']['RainTotal']);
      $werte['points']['sunPower'][]       = array($jahr,$output['values']['SunTotal']);

      $vonTimestamp = $jahr . '0101';
      $bisTimestamp = $jahr . '1231';
      $sql = "select wind_angle, sum(counter) summe
                from weather_wind_counter
               where date >= '" . $vonTimestamp . "'
                 and date <= '" . $bisTimestamp . "'
                 and wind_speed > 0
               group by wind_angle
               order by summe desc";
      $stmt = $db->query($sql);
      $j = 1;

      while ($row = $stmt->fetch(PDO::FETCH_ASSOC))
      {
         $werte['points']['windangle' . $j][] = array($jahr,$row['wind_angle']);
         $j++;
         if ($j > 3) break;
      }
   }

   foreach ($work[$minJahr] as $key => $value)
   {
      $work2[$key] = array();
   }

   foreach ($work as $jahr => $entity)
   {
      foreach ($entity as $key => $value)
      {
         $work2[$key][] = $value;
      }
   }

   $werte['values']['Von'] = $minJahr;
   $werte['values']['Bis'] = $maxJahr;

   $werte['values']['TempMin'] = min($work2['TempMin']);
   $werte['values']['TempMax'] = max($work2['TempMax']);
   $werte['values']['TempDurch'] = str_replace('.',',',round(array_sum($work2['TempDurch']) / $anzJahre,1));

   $werte['values']['HumMin'] = min($work2['HumMin']);
   $werte['values']['HumMax'] = max($work2['HumMax']);

   $werte['values']['PressMin'] = min($work2['PressMin']);
   $werte['values']['PressMax'] = max($work2['PressMax']);

   $werte['values']['WindMax'] = max($work2['WindMax']);

   $werte['values']['RainMin'] = min($work2['RainTotal']);
   $werte['values']['RainDurch'] = round(array_sum($work2['RainTotal']) / $anzJahre);
   $werte['values']['RainMax'] = max($work2['RainTotal']);

   $werte['values']['SunMin'] = min($work2['SunTotal']);
   $werte['values']['SunDurch'] = round(array_sum($work2['SunTotal']) / $anzJahre);
   $werte['values']['SunMax'] = max($work2['SunTotal']);

   $werte['values']['EistageMin'] = min($work2['Eistage']);
   $werte['values']['EistageDurch'] = str_replace('.',',',round(array_sum($work2['Eistage']) / $anzJahre,2));
   $werte['values']['EistageMax'] = max($work2['Eistage']);

   $werte['values']['FrosttageMin'] = min($work2['Frosttage']);
   $werte['values']['FrosttageDurch'] = str_replace('.',',',round(array_sum($work2['Frosttage']) / $anzJahre,2));
   $werte['values']['FrosttageMax'] = max($work2['Frosttage']);

   $werte['values']['HeiztageMin'] = min($work2['Heiztage15']);
   $werte['values']['HeiztageDurch'] = round(array_sum($work2['Heiztage15']) / $anzJahre);
   $werte['values']['HeiztageMax'] = max($work2['Heiztage15']);

   $werte['values']['SommertageMin'] = min($work2['Sommertage']);
   $werte['values']['SommertageDurch'] = str_replace('.',',',round(array_sum($work2['Sommertage']) / $anzJahre,2));
   $werte['values']['SommertageMax'] = max($work2['Sommertage']);

   $werte['values']['HeissetageMin'] = min($work2['Heissetage']);
   $werte['values']['HeissetageDurch'] = str_replace('.',',',round(array_sum($work2['Heissetage']) / $anzJahre,2));
   $werte['values']['HeissetageMax'] = max($work2['Heissetage']);

   $werte['values']['TropennachtMin'] = min($work2['Tropennacht']);
   $werte['values']['TropennachtDurch'] = str_replace('.',',',round(array_sum($work2['Tropennacht']) / $anzJahre,2));
   $werte['values']['TropennachtMax'] = max($work2['Tropennacht']);
}
catch (Exception $e)
{
   error_log('Jahre ' . $sql);
   header("HTTP/1.0 903 invalid post parameter");
   exit;
}
echo json_encode($werte);
?>