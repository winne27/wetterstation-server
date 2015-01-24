<?php
   header('Access-Control-Allow-Origin: *');
   include_once("../funktionen.php");
   include_once("../dbpdo.php");

   $sql = "start transaction";
   $stmt = $db->query($sql);

   $sql = "SELECT datetime from weather order by datetime desc limit 1";
   $stmt = $db->query($sql);
   $row = $stmt->fetch(PDO::FETCH_ASSOC);
   $output['values']['aktTag']   = substr($row['datetime'],0,10);
   $output['values']['aktTimestamp']   = substr($row['datetime'],11);
   echo json_encode($output);
?>