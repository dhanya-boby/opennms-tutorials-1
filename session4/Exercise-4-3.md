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

## Business Service Monitor - possible solution
Now you should realise that it would possible to do this using the `Business Service Monitor` to define a business service alarm for all of the possible reduction keys in each group for each camera. 
An example of one group5 alarm is shown below

![alt text](../session4/images/BSMReductionKey1.png "Figure BSMReductionKey1.png ")

This shows up in the topology like so.
![alt text](../session4/images/BSMReductionKey2.png "Figure BSMReductionKey2.png ")

The problem with this approach is that, while alarm grouping is possible, you need to build a configuration for every camera which quickly becomes unwieldy and error prone.

An alternative approach is to build a business rules configuration which can be extended to any number of cameras.

---
**NOTE**
* While in theory, this approach should work, I have had problems getting the BSM feature to recognise alarms through the reduction key. 
  This may be a bug with the the current version or a mis-configuration I have not recognised. 
  Regardless, as we aren't using this approach it doesn't really matter but i dont want you to waste time on it.
---


## Drools Rules Solution

In OpenNMS `situations` are alarms which group together associated alarms. 

Originally situations were created for use with the ALEC machine learning framework but drools can also be used to create and manage situations as we shall see here.

In this example, we are going to use drools rules to create a `situation` which groups together alarms from the same group (as defined in the list above).
If any of the alarms associated with a group occurs, a new situation is created or the alarm is added to an existing situation.

If all the alarms in a `situation` clear, the `situation` is also cleared.

### How Drools works in OpenNMS

OpenNMS uses [Red Hat Jboss Rules v 8.34.0](https://docs.jboss.org/drools/release/8.34.0.Final/drools-docs/docs-website/drools/introduction/index.html)

Drools is an enhanced implementation of the [Rete Algorithm](https://en.wikipedia.org/wiki/Rete_algorithm) which efficiently executes rules that match `facts` injected into the rules engine.

OpenNMS injects new Alarms into Drools and re-triggers the rule engine on each alarm state change.

Within the rules engine, the `Alarm facts` are represented by 
[OnmsAlarm.java](https://github.com/OpenNMS/opennms/blob/opennms-33.1.6-1/opennms-model/src/main/java/org/opennms/netmgt/model/OnmsAlarm.java) 
objects

`Alarm facts` are  are populated with links to the `lastevent` [OnmsEvent.java](https://github.com/OpenNMS/opennms/blob/opennms-33.1.6-1/opennms-model/src/main/java/org/opennms/netmgt/model/OnmsEvent.java) object and the `node` [OnmsNode.java](https://github.com/OpenNMS/opennms/blob/opennms-33.1.6-1/opennms-model/src/main/java/org/opennms/netmgt/model/OnmsNode.java) object associated with the event. 

As a note to programmers, these injected OnmsAlarm, OnmsEvent and OnmsNode objects are in the JPA detached state and not all of the fields are populated. 
For instance, while you can get access to a node category, you cannot access any node matadata because it is lazy loaded and not available in drools.
 
Internally, OpenNMS manages the lifecycle of alarms and situations using default rules defined in `alarms.drl` and `situations.drl` in [etc/alarmd/drools-rules.d](../pristine-opennms-config-files/etc-pristine/alarmd/drools-rules.d).

Any `.drl` drools definition files dropped into this folder will be loaded when OpenNMS starts up.

rules take the form of

```
rule "rule name"
  when
    ... rule definitions go here
  then
    ... java code to execute when the rule fires
end
```
In this session we do not have enough time to give a full overview of how the rule engine works but we can introduce the main concepts with this example.

### Exercise

Before proceeding to this [Exercise-4-3](../session4/Exercise-4-3.md), shutdown and clear the database for the previous EventTranslator project.

```
cd EventTranslator/minimal-minion-activemq
docker compose down -v
```
You should use the docker compose project under the `drools-corellation` folder for this exercise
[session4/drools-correlation/minimal-minion-activemq/](../session4/drools-correlation/minimal-minion-activemq/).

Start up the project and wait for OpenNMS to start up.

```
cd drools-corellation/minimal-minion-activemq
docker compose up -d
```

As before, you should use the administrators UI to load the node inventory from the [camera-locations.xml](../session4/drools-corellation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/imports/camera-locations.xml) requisition.

You will see that the example has the fully decoded events file and the event translator configuration from the previous [Exercise-4-2-answer](../session4/Exercise-4-2-answer.md).

* [etc/events/CAMERA-CONTROLLER-MIB.events.xml](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/events/CAMERA-CONTROLLER-MIB.events.xml)
* [etc/translator-configuration.xml](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/translator-configuration.xml)

Example traps are provided for camera_008 in [CAMERA-CONTROLLER Trap Examples](../session4/TrapExamplesCAMERA-CONTROLLER.md)

Once OpenNMS is running and you have loaded the [camera-locations.xml](../session4/drools-corellation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/imports/camera-locations.xml) requisition, try sending various traps from the example traps file.



You should see situations created which contain alarms from the underlying groups.

## Brief explanation of the rules

The creation of rules is an advanced topic and a full explanation of the rules engine is beyond the scope of this session. However some brief explanation is provided below for those who are interested in pursuing this further.

### speeding up alarm clears

If you look at the modified file [etc/drools-rules.d/alarmd.drl](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/alarmd/drools-rules.d/alarmd.drl), You will see one of the rules has been modified to delete cleared alarms in 10 seconds instead of after 5 minutes.

```
rule "cleanUp"
  salience 0
  when
    $sessionClock : SessionClock()
    $alarm : OnmsAlarm(severity.isLessThanOrEqual(OnmsSeverity.NORMAL) &&
                       alarmAckTime == null &&
                       (TTicketState == null || TTicketState == TroubleTicketState.CLOSED || TTicketState == TroubleTicketState.CANCELLED))
    // not( OnmsAlarm( this == $alarm ) over window:time( 5m ) )
    // CHANGE fast delete cleared alarms
    not( OnmsAlarm( this == $alarm ) over window:time( 10s ) )
  then
    alarmService.deleteAlarm($alarm);
end
```
### Alarm grouping rules

In OpenNMS Situations are just an alarm with some extra parameters.

Alarms are represented as situations if they contain one or more parameters (param) with a name starting with `related-reductionKey`.
Multiple `related-reductionKey` parameters are allowed if each parameter has a unique string after the `related-reductionKey` name e.g

The`related-reductionKey` param contains the reduction key of an alarm associated with this situation.

Events can be used to create and update situations if they contain `related-reductionKey` params.

In our example, we are using events defined in [etc/events/opennms.alarm.drools.situation.events.xml](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/events/opennms.alarm.drools.situation.events.xml) to create and display our situations.n
You will get more insight into how this works by looking at the `isRelatedReductionKeyWithContent(Parm param)` method in [AlarmPersisterImpl.java](https://github.com/OpenNMS/opennms/blob/opennms-33.1.8-1/opennms-alarms/daemon/src/main/java/org/opennms/netmgt/alarmd/AlarmPersisterImpl.java)
This code is used to match the related alarm reduction keys and mark this alarm as a situation.

The rules designed for this specific example are in the file [etc/drools-rules.d/chubb-rules.drl](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/alarmd/drools-rules.d/chubb-rules.drl)
The first rule in the file iss
```
rule "insert uei group map" 
```

You will see this rule runs once at start up and inserts a fact representing a hash map associating individual UEI's with particular groups

The next rule is 
```
rule "suppress camera controller alarms"
```

The present Event Translator definitions in [etc/translator-configuration.xml](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/translator-configuration.xml) reuse the existing event definitions when they create a new event. 

This means that we will see the old event against the `camera-controller` along side the new event for the `camera`.
We want to remove the original`camera-controller` events and this rule automatically clears them once they are created.

If we had defined new translated events in the event translator using the `url` parameter and used `donotpersist` for the original events, there would be no need for this rule.

The rule which creates group situations for multiple events is
```
rule "group mapping situation"
```

This rule use a number of pre-defined functions at the bottom of the file.

This rule looks for alarms which match the uei group map and checks to see if any group situations exist for each alarm.

If a situation does not exist, it is created and the alarm is added to it.

If a situation does exist which should have this alarm, it is added to the existing situation.

Situations automatically clear if all their associated alarms are cleared.

This rule creates new situations and associates alarms to the situation using drools situation update events `<uei>uei.opennms.org/alarms/drools/situation</uei>` defined in 
[etc/events/opennms.alarm.drools.situation.events.xml](../session4/drools-correlation/minimal-minion-activemq/container-fs/horizon/opt/opennms-overlay/etc/events/opennms.alarm.drools.situation.events.xml)







