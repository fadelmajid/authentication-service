AUTHENTICATION SERVICE
==============

Setup
------------
1. Make sure you've install docker
2. In this directory, run command: `docker build .`
2. ignore if there's a red text, wait until finish
4. run command: `docker-compose up` or `docker-compose up -d` to initiate DB and start the service
5. Import the POSTMAN folder to your POSTMAN application
6. and read DOCUMENTATION FOR DETAIL FLOW / SCENARIO
7. try the endpoint

DOCUMENTATION FOR DETAIL FLOW / SCENARIO
------------
available on https://docs.google.com/document/d/1WsTnrpz6_3u0FVOO6HDxrSgldVc9THfFnOkJmr3x6o0/edit?usp=sharing

POSTMAN Collection and Environment
------------
available on folder postman, you can import all the file to postman. (examples of inputs and outputs are available)

LOGS
------------
containing information of application

Error Code and Definition
------------
available on folder app/lang in file en.json

TESTING
-----------
available automation testing with mochajs & chaijs just for the library. if you already run "npm start", you can run
the test by "npm test" on folder test in different terminal