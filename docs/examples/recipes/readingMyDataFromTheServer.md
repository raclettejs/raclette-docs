# Our Datatype

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

dingsbums

<!--@include: ../cooking-steps/client/api/pluginApiDataRead.md-->
