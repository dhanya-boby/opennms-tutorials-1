
[Main Menu](../README.md) | [Session 5](../session5/README.md) | [Exercise-5-2](../session5/Exercise-5-2.md)

# Exercise 5-2 Collecting from an SNMP Table

## Introduction

In [Exercise-5-1](../session5/Exercise-5-1.md) we looked at extending the default data collection package to collect data from a discrete set of OID's for a device. 

In this exercise we will look at storing data from an SNMP table and also how to define a new data collection package different from the default package.

Many SNMP measurements are exposed as tables, where the user recognisable name of a value may be in one column, while the actual value may be in another column of the same line entry in the table.

For instance if we do an SNMP walk of the hrStorage table (oid .1.3.6.1.2.1.25.2.3) using mibbrowser, we will see the following result:

![alt text](../session5/images/hrStorageTable-mibbrowser.png "Figure hrStorageTable-mibbrowser.png")

You can see that the hrStorageDescr column gives names to the values in the other columns (Physical Memory, Virtual Memory /dev etc)

We dont necessarily know in advance how many of these resources exist or how these resources are named in the table, so we need a way to store all the rows of the data in the table with usable names corresponding to the names found in the table.
In OpenNMS, we want the name and path to the rrd files to be related to the names in this table but we can see already that the names have spaces and slashes `/` which we definitely don't want in the name of a file.

OpenNMS has a variety of storage strategies which can interpret the table names and create a resource path which defines where to store and name the rrd files for each data collection. 

There a number of strategies described in [OpenNMS Resource Types](https://docs.opennms.com/meridian/2024/operation/deep-dive/performance-data-collection/resource-types.html). 
Some of these are quite complex and would require a bit of study of existing configurations where they are used. 

However, in this case  the answer is to use the relatively simple `SiblingColumnStorageStrategy` which applies regular expressions to the resource names in the table in order to create a clean path to the rrd where we will store the data.


## Tasks

### Step 1: Create a resource type for entries in the table

![hr-description.png](images/hr-description.png)

File: `etc/resource-types.d/exercise_5.2.xml`

```xml
<?xml version="1.0"?>
<resource-types>
    <resourceType name="hrStorageIndex" label="Host Resources Storage" resourceLabel="${hrStorageDescr}">
        <persistenceSelectorStrategy class="org.opennms.netmgt.collection.support.PersistAllSelectorStrategy"/>
        <storageStrategy class="org.opennms.netmgt.dao.support.SiblingColumnStorageStrategy">
            <parameter key="sibling-column-name" value="hrStorageDescr"/>
            <parameter key="replace-first" value="s/^-$/_root_fs/"/>
            <parameter key="replace-all" value="s/^-//"/>
            <parameter key="replace-all" value="s/\s//"/>
            <parameter key="replace-all" value="s/:\\.*//"/>
        </storageStrategy>
    </resourceType>
</resource-types>
```

### Step 2: Create data-collection group

Define which metrics you want to collect on which SNMP agent, in our case identified by system object ID: `.1.3.6.1.4.1.61509.42.1`

![hr-entry.png](images/hr-entry.png)

File: `etc/datacollection/exercise_5.2.xml`

```xml
<datacollection-group xmlns="http://xmlns.opennms.org/xsd/config/datacollection" name="exercise_5.2-group">
  <group name="exercise_5.2-host-resources-storage" ifType="all">
    <mibObj oid=".1.3.6.1.2.1.25.2.3.1.2" instance="hrStorageIndex" alias="hrStorageType" type="string"/>
    <mibObj oid=".1.3.6.1.2.1.25.2.3.1.3" instance="hrStorageIndex" alias="hrStorageDescr" type="string"/>
    <mibObj oid=".1.3.6.1.2.1.25.2.3.1.4" instance="hrStorageIndex" alias="hrStorageAllocUnits" type="gauge"/>
    <mibObj oid=".1.3.6.1.2.1.25.2.3.1.5" instance="hrStorageIndex" alias="hrStorageSize" type="gauge"/>
    <mibObj oid=".1.3.6.1.2.1.25.2.3.1.6" instance="hrStorageIndex" alias="hrStorageUsed" type="gauge"/>
  </group>
  <systemDef name="Exercise-5.1-SNMP-System">
    <sysoid>.1.3.6.1.4.1.61509.42.1</sysoid>
    <collect>
      <includeGroup>exercise_5.2-host-resources-storage</includeGroup>
    </collect>
  </systemDef>
</datacollection-group>

```

### Step 3: Associate a data collection group to an SNMP collection

File: `etc/datacollection-config.xml`

```xml
<snmp-collection name="exercise-5.2-snmp-collection" snmpStorageFlag="select">
  <rrd step="300">
    <rra>RRA:AVERAGE:0.5:1:20160</rra>
    <rra>RRA:AVERAGE:0.5:12:14880</rra>
    <rra>RRA:AVERAGE:0.5:288:3660</rra>
    <rra>RRA:MAX:0.5:288:3660</rra>
    <rra>RRA:MIN:0.5:288:3660</rra>
  </rrd>
  <include-collection dataCollectionGroup="exercise_5.2-group"/>
</snmp-collection>
```

### Step 4: Define an SNMP collection service with the SNMP collection

File: `etc/collectd-configuration.xml`

```xml
<package name="Exercise-5.2-SNMP-Package" remote="false">
  <filter>IPADDR != '0.0.0.0'</filter>
  <include-range begin="1.1.1.1" end="254.254.254.254"/>
  <include-range begin="::1" end="ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"/>
  <service name="SNMP-Custom-Agent" interval="30000" user-defined="false" status="on">
    <parameter key="collection" value="exercise-5.2-snmp-collection"/>
    <parameter key="thresholding-enabled" value="true"/>
  </service>
</package>
```

### Step 5: Define a SNMP-Custom-Agent service on an interface

You need to define a new service to collect this data and provision it on the node. 

In the requisition add the `SNMP-Custom-Agent` service to the interface on linux02

You can do this on the UI:

![alt text](../session5/images/requisition-snmpcustomagent.png "Figure requisition-snmpcustomagent.png")

Or directly in the requisition file `etc/linux-server.xml`

```
 <node location="Default" foreign-id="linux-02" node-label="linux-02">
    <interface ip-addr="172.20.0.102" status="1" snmp-primary="P">
      <monitored-service service-name="ICMP"/>
      <monitored-service service-name="SNMP"/>
      <monitored-service service-name="SNMP-Custom-Agent"/>
    </interface>
    <asset name="longitude" value="9.1685303"/>
    <asset name="latitude" value="48.8258763"/>
  </node>
```

### Step 5: Verify data collection

```
docker compose exec horizon ls share/rrd/snmp/fs/linux-server/linux-01
```

Also look on the resource graphs for the node:

![alt text](../session5/images/graphs-hostresoursestorage.png "Figure graphs-hostresoursestorage.png") 

