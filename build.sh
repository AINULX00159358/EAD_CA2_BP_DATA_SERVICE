#!/bin/bash
echo 'running docker build'
MONGOIP=`docker container inspect -f '{{ .NetworkSettings.IPAddress }}' mongodb`
echo "got mongodb ip address $MONGOIP"
echo "running docker build"
docker build --no-cache --tag bpdataservice:CA2_TEST_V1 .
echo 'running docker image'

docker run --name bpdataservice-test --net=bridge -p 43256:43256 --rm -e "MONGO_CREDENTIALS=zorok:indiaNopels" -e "MONGO_CONN_URI=$MONGOIP:27017/?authMechanism=SCRAM-SHA-1" bpdataservice:CA2_TEST_V1
