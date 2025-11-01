# SNMP configuration - side note

In a previous version of this session, a NetSNMP container developed by Ronny Tromer was used.

https://github.com/labmonkeys-space/app-container/tree/main/net-snmp

```
image: quay.io/labmonkeys/net-snmp:5.9.4-r0.b2384
```

I have substituted the older image used in the rest of the tutorial `polinux/snmpd` which uses netsnmp 5.7.2  because 
* It matches the rest of the tutorial sessions
* It also contains useful snmputils like snmpwalk and snmptrap
* It can be downloaded through our university firewall (quay.io is blocked)

However 1inux-01 and linux_02 adopt the same `conf.d` configuration used in `net-snmp:5.9.4-r0` in order to change the sysObjectId etc.

note linux-01, linux-02 use the sysObjectId `.1.3.6.1.4.1.61509`, a private enterprise number registered with the Internet Assigned Numbers Authority (IANA) to the company VPIsystem


1inux-03 and linux_04 modify the normal netsnmp.conf file used in `polinux/snmpd`.
This has the NetSNMP sysObjectId  `.1.3.6.1.4.1.8072.3.2.10`