[Main Menu](../README.md) | [Session 2](../session2/README.md) | [Exercise-2-service-monitoring](../session1/Exercise2-service-monitoring1.md)

# Exercise Service Monitoring

## service 3 tier network

Often sites are made scalable through load-balancing a number of servers. 
In this example we have installed three wordpress servers behind an NGINX load balancer.

All there server share the same MariaDB database which also maintains the session data across the servers.

![alt text](../session2/images/examplenetwork-loadbalance.drawio.png "Figure examplenetwork-loadbalance.drawio.png")

## running the example

```
cd minimal-minion-activemq
docker compose up -d

[+] Running 21/21
 ✔ Network minimal-minion-activemq_N001               Created
 ✔ Network minimal-minion-activemq_N000               Created
 ✔ Volume "minimal-minion-activemq_wp_data"           Created
 ✔ Volume "minimal-minion-activemq_db_data"           Created
 ✔ Volume "minimal-minion-activemq_data-opennms"      Created
 ✔ Volume "minimal-minion-activemq_data-opennms-cfg"  Created
 ✔ Volume "minimal-minion-activemq_data-postgres"     Created

OpenNMS containers
 ✔ Container database                                 Started
 ✔ Container horizon                                  Started
 ✔ Container minion1                                  Started
 
SNMP Example Containers
 ✔ Container netsnmp_1_1                              Started
 ✔ Container netsnmp_1_2                              Started
 ✔ Container netsnmp_2_1                              Started
 ✔ Container netsnmp_2_2                              Started
 ✔ Container chubb_camera_01                          Started

Service Management Example  containers ( Wordpress Service)
 ✔ Container nginx                                    Started
 ✔ Container db                                       Started
 ✔ Container wordpress1                               Started
 ✔ Container wordpress2                               Started
 ✔ Container wordpress3                               Started
 ✔ Container wordpress-cli                            Started
```

## Testing Word press and the load balancer

The three wordpress instances share the same configuration and static data.
They also connect to the same database.

The `wordpress-cli` container configures the wordpress instances with an initial user and front page blog post.

All three containers sit behind the nginx container which both terminates the https/tls traffic and acts as a round robin load balancer.

browse to `https://localhost` and view the following  landing page with links to wordpress and wordpress admin pages

![alt text](../session2/images/nginx-html.png "Figure nginx-html.png")

![alt text](../session2/images/wordpress1.png "Figure wordpress1.png")

The wordpress admin page allows login with a username and password 
* Username admin
* Password secret


![alt text](../session2/images/wordpress2.png "Figure wordpress2.png")

The wordpress admin page should show up as below.

![alt text](../session2/images/wordpress3.png "Figure wordpress3.png")

To test that the load balancing is working, open three terminals use each one to view the word press logs for each of the wordpress instances

```
docker compose logs -f wordpress1

docker compose logs -f wordpress2

docker compose logs -f wordpress3
```

If you repeatedly refresh the Wordpress login page, you should see the logs advance one at a time for each of the wordpress instances as they are polled by the load balancer.

![alt text](../session2/images/loadbalance-example1.png "Figure loadbalance-example1.png")


## Monitoring with OpenNMS

OpenNMS can monitor the load balancer, each of the word press servers and the state of the database.

browse to http://localhost:8980/opennms and login using user:admin password:admin

Go to hte requistions page and inspect the test-wordpress.xml requisition. 
Synchronise this requisition and see each of the servers in the nodes page


## Business Service Monitoring


