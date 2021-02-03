# icinga2-burrow-plugin

A plugin for Icinga2 to access the [Burrow API](https://github.com/carrot/burrow) to get a total count of unread messages (lag) of all consumers in all clusters. The plugin supports three parameters:

1. Burrow API Base URL e.g. http://1.2.3.4:9991/v3
2. Warning threshold
3. Critical threshold

It returns a message in a Icinga2 supported format: `OK - ..., WARNING - ..., CRITIAL - ...`

## Usage

You have to clone the plugin e.g. in the `/usr/lib/nagios/plugins` folder and install it:

```
git clone https://github.com/egodigital/icinga2-burrow-plugin.git
npm install
```

Change the location in the [run](run) file, if you used another path and define an Icinga2 command like this:

```
object CheckCommand "check_kafka_lag" {
  command = [ PluginDir + "/icinga2-burrow-plugin/run" ]

  arguments = {
    "-u" = "http://1.2.3.4:9991/v3"
    "-w" = "10000"
    "-c" = "50000"
  }
}
```
Change the path to another folder, if you cloned it somewhere else.

Define a Host that uses the `check_kafka_lag` command:

```
object Host "some-host" {
  import "generic-host"
  
  check_command = "check_kafka_lag"

  vars.os = "Linux"
}
```

Don't worry about not knowing about a lot of unread messages by your comsumers.