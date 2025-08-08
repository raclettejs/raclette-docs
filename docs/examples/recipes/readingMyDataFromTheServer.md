# Reading Data from the Server

## Context

Will teach you how to declare a route and how to read data from it

## Prerequisites

- Raclette CLI installed
- Raclette Server running
- Node.js 24+

**Estimated Time:** 10min
**Difficulty:** Easy
**Version:** 3.x+

## Our Datatype

At first we need to specify our dataType and what we want to query. For this Example we will assume:

```
DATATYPE = "todo"
ROUTENAME = "getAllTodos"
QUERY_PARAMS = null
```

## Declare route on the server side

## Declare route on the client side

In our `./plugins/[PLUGIN_NAME]/client/index.ts` we want to define our Raclette Plugin with our custom clientside endpoints.

<!--@include: ../cooking-steps/client/plugin/routeDeclaration.md-->

## Reading data in our widget

Now we can query our endpoint with the clientApi fron our component

<!--@include: ../cooking-steps/client/api/pluginApiDataRead.md-->

## What's Next

- [Add User Authentication](docs.raclettejs.com)
- [Implement Offline Support](docs.raclettejs.com)
- [Create Plugin Documentation](docs.raclettejs.com)
