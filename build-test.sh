docker build --no-cache --tag bpdataservice:CA2_TEST_V1 .
docker run -d -p 43256:43256 bpdataservice:CA2_TEST_V1
