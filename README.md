# wetterstation-server
This node.js server delivers measured values from a private weather station to Javascript clients in browser, 
to Android, iOs and WindowsPhone apps and to Android homescreen widgets. The connection is established by websockets. 
The data from the weather station were written every 5 minutes to a MariaDB. Database trigger then fires a node.js event which 
delivers the new values to all connected clients.


