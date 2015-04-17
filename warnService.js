var nodemailer = require('nodemailer');
var crypto     = require('crypto');
var funcs      = require('./functions');
var params     = require('./params');
var mailer     = nodemailer.createTransport();
var mysql      = require('mysql');
var dbacc      = require('/etc/auth/wetterstation.js');
//var db         = mysql.createConnection(dbacc.dbAccount);

exports.handleRequest = function(ios,data)
{
   funcs.mylog('warnrequest startet for ' + data.email);
   var hash = crypto.randomBytes(12).toString('hex');
   var insData =
   {
      type: 1,
      email: data.email,
      hash:  hash
   }

   var db = mysql.createConnection(dbacc.dbAccount);
   var query = db.query('INSERT INTO warnung SET ?', insData, function(err, result)
   {
      if (err)
      {
         funcs.mylog('Fehler beim Insert:');
         console.log(err);
         ios.sockets.emit('successWarningEntry',{msg: err,type: data.type, err: true});
      }
      else
      {
         mailer.sendMail(
         {
             from: 'wetterstation@fehngarten.de',
             to: data.email,
             subject: 'Bodenfrostwarnung',
             text: 'Um die Anmeldung zu der Bodenfrostwarnung abzuschließen bitte auf den folgenden Link klicken: \n ' +
                   'https://socken.fehngarten.de/confirm?hash=' + hash + '&wnr=' + result.insertId + '&type=init',
             html: 'Um die Anmeldung zu der Bodenfrostwarnung abzuschließen bitte auf den folgenden Link klicken:<br> ' +
                   '<a target="blank" href="https://socken.fehngarten.de/confirm?hash=' + hash + '&wnr=' + result.insertId + '&type=init">https://socken.fehngarten.de/confirm?hash=' + hash + '&wnr=' + result.insertId + '&type=init</a>'
         });
         ios.sockets.emit('successWarningEntry',{msg: 'erfolgreich eingetragen',type: data.type, err: false});
      }
      db.end();
   });
}
exports.confirmRequest = function(response,getvars)
{
   funcs.mylog('warnconfirm startet for wnr = ' + getvars.wnr);
   if (getvars.type == 'init')
   {
      var sql = 'UPDATE warnung SET validfrom = now() where wnr = ? and hash = ?';
      var values = [getvars.wnr,getvars.hash];
      var template1 = 'Die Aktivierung ist leider fehlgeschlagen.';
      var template2 = 'Die Bodenfrostwarnung wurde erfolgreich aktiviert.';
   }
   else if (getvars.type == 'disable')
   {
      var sql = 'UPDATE warnung SET validfrom = date_add(now(),interval 99 year) where wnr = ? and hash = ?';
      var values = [getvars.wnr,getvars.hash];
      var template1 = 'Die Deaktivierung ist leider fehlgeschlagen.';
      var template2 = 'Sie erhalten keine Bodenfrostwarnung mehr von der Wetterstation Rhauderfehn.';
   }
   else if (getvars.type == 'nextyear')
   {
      var monat = funcs.getHeute['Monats']();
      var jahr = funcs.getHeute['Jahr']();
      var nextDate = (monat < '05') ? jahr + '-05-01' : (+jahr + 1) + '-05-01';
      var sql = 'UPDATE warnung SET validfrom = \'' + nextDate + '\' where wnr = ? and hash = ?';
      var values = [getvars.wnr,getvars.hash];
      var template1 = 'Die Änderung ist leider fehlgeschlagen.';
      var template2 = 'Sie erhalten erst ab dem kommenden Mai wieder Bodenfrostwarnungen.';
   }
   else
   {
      return;
   }

   var db = mysql.createConnection(dbacc.dbAccount);
   db.query(sql, values , function(err, result)
   {
      //console.log(result);
      if (err)
      {
         funcs.mylog('Fehler beim Update:');
         console.log(err);
         var data = template1 + '<br> Bitte senden Sie eine E-Mail an wetterstation@fehngarten.de';
      }
      else if (result.affectedRows == 0)
      {
         funcs.mylog('Fehler beim Update:');
         console.log(getvars);
         var data = template1 + '<br> Bitte senden Sie eine E-Mail an wetterstation@fehngarten.de';
      }
      else
      {
         var data = template2;
      }
      var html = '<div style="display:block;margin:30px auto;width:770px;">';
      html += '<img style="cursor:pointer;margin-right: 20px;" title="Webseite aufrufen" onclick="location.href=\'https://www.fehngarten.de/wetter/index.html\'" src="https://www.fehngarten.de/wetter/img/logo.png" alt="" />';
      html += '<span style="display: inline-block">' + data + '<br><br><a href="https://www.fehngarten.de/wetter/index.html">Weiter zur Wetterstation Rhauderfehn</a></span></div>';
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(html, "utf8");
      response.end();
      db.end();
   });
}

exports.checkDewpoint = function()
{
   var db = mysql.createConnection(dbacc.dbAccount);
   db.query('SELECT dewpoint, temp_out from weather order by datetime desc limit 1', function(err, rows)
   {
      if (err)
      {
         funcs.mylog('Fehler beim Select dewpoint:');
         console.log(err);
      }
      else
      {
         var dewpoint = rows[0].dewpoint;
         var warnIndex = -1;
         var prob = 0;
         for (var i = 0; i < params.frostWarning.length; i++)
         {
             if (dewpoint < params.frostWarning[i].dewpoint)
             {
                warnIndex = i;
                prob = params.frostWarning[i].prob;
                break;
             }
         }
         if (prob > 0)
         {
            db.query('SELECT email, hash, wnr from warnung where validfrom <= now()', function(err, rows)
            {
               if (err)
               {
                  funcs.mylog('Fehler beim Select emails:');
                  console.log(err);
                  db.end();
               }
               else
               {
                  var text = params.frostWarning[i].text + "\n\nWahrscheinlichkeit für Bodenfrost: " + params.frostWarning[i].prob + '%';
                  var html = '<body style="font-family: \'Trebuchet MS\', Verdana, sans-serif">' + params.frostWarning[i].html +
                             '<br><br>Wahrscheinlichkeit für Bodenfrost: <b>' + params.frostWarning[i].prob + '%</b>' +
                             '<br><br><a target="blank" href="https://www.fehngarten.de/wetter/index.html">Aktuelle Wetterdaten anschauen</a>';

                  for (var j in rows)
                  {
                     var text2 = text + "\n\n" +
                                 "---------------------------------------------------------------\n\n" +
                                 'Falls Sie erst im kommenden Mai (Eisheilige) wieder gewarnt werden wollen, bitte auf folgenden Link klicken:' + "\n" +
                                 'https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=nextyear' + "\n\n" +
                                 'Falls Sie überhaupt nicht mehr gewarnt werden wollen, bitte auf folgenden Link klicken:' + "\n" +
                                 'https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=disable' + "\n\n";
                     var html2 = html + "<br><br><hr><br>" +
                                 'Falls Sie erst im kommenden Mai (Eisheilige) wieder gewarnt werden wollen, bitte auf folgenden Link klicken:<br>' +
                                 '<a target="blank" href="https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=nextyear">' +
                                 'https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=nextyear</a><br><br>' +
                                 'Falls Sie überhaupt nicht mehr gewarnt werden wollen, bitte auf folgenden Link klicken:<br>' +
                                 '<a target="blank" href="https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=disable">' +

                                'https://socken.fehngarten.de/confirm?hash=' + rows[j].hash + '&wnr=' + rows[j].wnr + '&type=disable</a><br><br>';
                     /* */
                     mailer.sendMail(
                     {
                        from: 'wetterstation@fehngarten.de',
                        to: rows[j].email,
                        subject: 'Bodenfrostwarnung - ' + params.frostWarning[i].prob + '%',
                        text: text2,
                        html: html2
                     });
                     /* */
                  }
               }
               db.end();
            });
         }
      }
   });
}