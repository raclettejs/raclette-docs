# Reading Data from the Server

**Estimated Time:** 10min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to declare a route and how to read data from it

## Prerequisites

- Raclette CLI installed
- Raclette Server running
- Node.js 24+

## Our Datatype

At first we need to specify our dataType and what we want to query. For this Example we will assume:

```variables
PLUGINNAME = "example-todoplugin"
DATATYPE = "todo"
ROUTENAME = "getAllTodos"
ROUTEMETHOD = "get"
```

## Our Serverside Setup

## Declare route on the server side

## Declare route on the client side

In our `./plugins/PLUGINNAME/client/index.ts` we want to define our Raclette Plugin with our custom clientside endpoints.

<!--@include: ../cooking-steps/client/plugin/routeDeclaration.md{STOREACTIONTYPE:dataPush}-->

## Reading data in our widget

Now we can query our endpoint with the clientApi fron our component

<!--@include: ../cooking-steps/client/api/data.md{RESPONSETYPE:json} -->

::: tip
If you want to await the retrieval of your data, set immediate: false and use `await execute()`
:::
