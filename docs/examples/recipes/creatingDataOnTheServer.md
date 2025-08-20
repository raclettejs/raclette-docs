# Creating Data on the Server

**Estimated Time:** 5min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to create an Item for the previous defined DataType

## Prerequisites

- Raclette CLI installed
- Raclette Server running
- Node.js 24+
- You have finished the setting up a todo plugin example and it's up and running

```variables
PLUGINNAME: example-todoplugin
DATATYPE: todo
SCHEMANAME: Todo
STOREACTIONTYPE: dataCreate
BODYSCHEMA: todoCreateSchema
ROUTENAME: create
ROUTEMETHOD: post
RESPONSETYPE: json
```

## Declare create Service

In our `./plugins/${PLUGINNAME:example-plugin}/server/${DATATYPE:example}.service.ts` we now want to define the service logic for our data creation

<!--@include: ../cooking-steps/server/plugin/service.md{
BUSINESSLOGIC: |
  async _create${SCHEMANAME:Example}(
        fastify: PluginFastifyInstance,
        ${DATATYPE:example}Body: ${SCHEMANAME:Example}Create,
      ): Promise<${SCHEMANAME:Example}Type> {
        try {
          if (${DATATYPE:example}Body._id) {
            const uuidValid = validate(${DATATYPE:example}Body._id)

            if (!uuidValid) {
              throw new Error("Invalid ID - not a valid uuid v4")
            }

            const duplicate = await this.${DATATYPE:example}Model.findById(${DATATYPE:example}Body._id)

            if (duplicate) {
              throw new Error("An entry with this id already exists")
            }
          } else {
            ${DATATYPE:example}Body._id = uuidv4()
          }

          const ${DATATYPE:example} = new this.${DATATYPE:example}Model(${DATATYPE:example}Body)

          await ${DATATYPE:example}.save()
          fastify.log.info(`[API] Created ${DATATYPE:example} #${${DATATYPE:example}._id}`)

          return ${DATATYPE:example}.toObject ? ${DATATYPE:example}.toObject() : ${DATATYPE:example}
        } catch (err: any) {
          fastify.log.error(err.message)
          throw err
        }
      }

      /**
      * Create a new ${DATATYPE:example} with payload wrapping and event emission
      */
      async create${SCHEMANAME:Example}(
        fastify: PluginFastifyInstance,
        requestData: ClientPayloadRequestData,
        ${DATATYPE:example}Body: ${SCHEMANAME:Example}Create,
      ): Promise<ClientPayload<${SCHEMANAME:Example}Type[]>> {
        const ${DATATYPE:example} = await this._create${SCHEMANAME:Example}(fastify, ${DATATYPE:example}Body)

        const payload = await create${SCHEMANAME:Example}Payload(fastify, [${DATATYPE:example}], requestData)
        if (requestData.broadcast) {
          fastify.emit("${DATATYPE:example}Created", payload)
        }

        return payload
      }
}-->

## Declare route on the server side

In our `./plugins/${PLUGINNAME:example-plugin}/server/routes/` we want to create a new route called `${DATATYPE:example}.create.ts`

<!--@include: ../cooking-steps/server/plugin/routes/route.md{
BUSINESSLOGIC: |
  // Add owner and lastEditor from the authenticated user
        const ${DATATYPE:example}Data = {
          ...req.body,
          owner: req.user._id,
          lastEditor: req.user._id,
        }

        const payload = await fastify.custom.${DATATYPE:example}Service.create${SCHEMANAME:Example}(
          fastify,
          req.requestParams,
          ${DATATYPE:example}Data,
        )

        return reply.status(201).send(payload)
}-->

## Creating data in our widget

Now we can query our endpoint with the clientApi fron our component

<!--@include: ../cooking-steps/client/api/data.md -->

After defining our action and the corresponding outputs we can now trigger the action when needed.

```typescript
const createData = async (newItem) => {
  // log the action outputs before and after to see what happens!
  console.log(data, query, execute, isLoading, error)
  const createdItem = await execute(newItem)
  // log the action outputs before and after to see what happens!
  console.log(createdItem)
  console.log(data, query, execute, isLoading, error)
}
```
