[Main Menu](../README.md) | [Session 4](../session4/README.md) | [Exercise-4-3](../session4/Exercise-4-3.md)

# Exercise 4-3 

## Scenario

The configuration in [Exercise-4-2 Answer](../session4/Exercise-4-2-answer.md) worked well but the customer complained that there are too many possible alarms. 
They did not want to see all of the detailed alarms but a simplified set of service alarms which consolidated the possible alarms into five groups.
Thus they wanted to see a `group5` service alarm if any of the alarms in `group5` were present or a `group1` service alarm if any of the alarms in group1 were present.

The grouping of alarm uei's is listed in the table below.


| UEI                                                               | Group Alarm    |
|:------------------------------------------------------------------|:---------------|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/panMotor| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/panMotor-clear| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/tiltMotor| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/tiltMotor-clear| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/zoomMotor| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/zoomMotor-clear| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/apertureMotor| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/apertureMotor-clear| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/focusMotor| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/focusMotor-clear| group5 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/wiperMotor| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/wiperMotor-clear| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/heater| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/heater-clear| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/fluidLevel| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/fluidLevel-clear| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/videoSignal| group4|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/videoSignal-clear| group4|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/housingTamper| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/housingTamper-clear| group6 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/washerMotorFault| group6|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/washerMotorFault-clear| group6 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/configPlugFault| group2|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/configPlugFault-clear| group2 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChange/tvbuCameraCommsFault| group3|
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear/tvbuCameraCommsFault-clear| group3 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/healthChangeClear| group1 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/tamperDetectedCleared| group1 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/logicInputChange| group1 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/logicInputChangeCleared| group1 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/commsStateChange| group1 |
| uei.opennms.org/traps/CHUBB-TVBS-CAMERA-MIB/commsStateChangeClear| group1 |

Now you should realise that it would possible to do this using the `Business Service Monitor` to define a business service alarm for all of the possible reduction keys in each group for each camera. 
An example of one group5 alarm is shown below

![alt text](../session4/images/BSMReductionKey1.png "Figure BSMReductionKey1.png ")

This shows up in the topology like so.
![alt text](../session4/images/BSMReductionKey2.png "Figure BSMReductionKey2.png ")

The problem with this approach is that, while alarm grouping is possible, you need to build a configuration for every camera which quickly becomes unwieldy and error prone.

An alternative approach is to build a business rules configuration which can be extended to any number of cameras.

Before proceeding to [Exercise-4-3](../session4/Exercise-4-3.md), shutdown and clear the database for the EventTranslator project.
```
cd EventTranslator/minimal-minion-activemq
docker compose down -v
```
You should use the docker compose project under the `drools-corellation` folder for this exercise
[session4/drools-correlation/minimal-minion-activemq/](../session4/drools-correlation/minimal-minion-activemq/).


We also looked in [Session 2](../session2/README.md) at how business servicing monitoring can build a graph of services which allows us to determine the business impact of a monitored service failure.

