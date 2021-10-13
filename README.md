This is the README for the Coladays Booking System

The Coladays booking system is composed of:
- a MySQL database
- a backend app built on top of https://nodejs.org/en/ and https://socketcluster.io/
- a frontend app built on top of https://angular.io/ and https://material.angular.io/ 
- a 3rd IdentiftyProvider https://auth0.com/

The system can entirely be run within Docker.

Before building the Docker images, please make sure the ports 4200 (Frontend), 8000 (Server) and 3306 (MySQL) are free.
```
sh build-coladays.sh
```

Create and run containers
```
sh start-coladays.sh
```

Stop and remove containers
```
sh stop-coladays.sh
```

How to interact with the system

Once the application is running, navigate to http://localhost:4200
On the first usage, the user should be redirected to the login screen. 3 ready-made users are already available. The credentials to use them are:
- james@coladays.com / coladays
- elvis@coladays.com / coladays
- richard@coladays.com / coladays

Alternatively, the user can 'sign up' and create other users in the system

The booking grid should be empty at the first usage. 
By clicking on a cell, the user is prompted with a dialog from where he can book several slots for a room.
Once the booking is confirmed, the cells will turn to blue.
By clicking on any of the blue cells, the user will be prompted with a dialog in order to cancel its booking.
The booking created by the other users will appears in red.

The application has low latency as it is built on top of SocketCluster. 
It is possible to test the application with 2 or 3 concurrent users by opening different browsers (tested with Chrome, Safari, Firefox). 
New booking and cancelation should be refreshed on each users screen immediately.












