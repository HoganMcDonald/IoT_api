Small serve for storing settings and sending notifications. See deploy.service for ENV vars.

Send a notification `POST /execute` with body
```
{
  "secret": "<secret value>"
}
```

`GET /settings` to get a list of all settings in the following format

```
[{
    "name": "email",
    "value": "foo@example.com"
}, {
    "name": "phone number",
    "value": "9524542050"
}, {
    "name": "message",
    "value": "Sensor activated"
}]
```

Or you can request them by name `GET /settings/email`
```
{
    "name": "email",
    "value": "foo@example.com"
}```
