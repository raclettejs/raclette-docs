# Creating Data on the Server

**Estimated Time:** 5min
**Difficulty:** Easy
**Version:** 0.1.\*

## Context

Will teach you how to create an Item for the previous defined DataType

## Prerequisites

- raclette CLI installed
- raclette Server running
- Node.js 24+
- You have finished the setting up a todo plugin example and it's up and running

## Declare create Service

In our `./plugins/example-todoplugin/backend/todo.service.ts` we now want to define the service logic for our data creation

```typescript
import type {
  Todo,
  Todo as TodoType,
} from "./todo.schema"
import type { QueryOptions } from "@_/types/service"
import { v4 as uuidv4, validate } from "uuid"
import { createTodoPayload } from "./helpers/todoHelper"
import type {
  PluginFastifyInstance,
  FrontendPayload,
  FrontendPayloadRequestData,
} from "@raclettejs/core/types"
import { Model } from "mongoose"

export class TodoService {
  private todoModel: Model<Todo>

  constructor(model: Model<Todo>) {
    this.todoModel = model
  }
  [...]
   async _createTodo(
     fastify: PluginFastifyInstance,
     todoBody: TodoCreate,
   ): Promise<TodoType> {
     try {
       if (todoBody._id) {
         const uuidValid = validate(todoBody._id)
   
         if (!uuidValid) {
           throw new Error("Invalid ID - not a valid uuid v4")
         }
   
         const duplicate = await this.todoModel.findById(todoBody._id)
   
         if (duplicate) {
           throw new Error("An entry with this id already exists")
         }
       } else {
         todoBody._id = uuidv4()
       }
   
       const todo = new this.todoModel(todoBody)
   
       await todo.save()
       fastify.log.info(`[API] Created todo #todo._id}`)
   
       return todo.toObject ? todo.toObject() : todo
     } catch (err: any) {
       fastify.log.error(err.message)
       throw err
     }
   }
   
   /**
   * Create a new todo with payload wrapping and event emission
   */
   async createTodo(
     fastify: PluginFastifyInstance,
     requestData: FrontendPayloadRequestData,
     todoBody: TodoCreate,
   ): Promise<FrontendPayload<TodoType[]>> {
     const todo = await this._createTodo(fastify, todoBody)
   
     const payload = await createTodoPayload(fastify, [todo], requestData)
     if (requestData.broadcast) {
       fastify.emit("todoCreated", payload)
     }
   
     return payload
   }
  [...]
}

export const createTodoService = (model: Model<Todo>) => {
  return new TodoService(model)
}

```

## Declare route on the backend side

In our `./plugins/example-todoplugin/backend/routes/` we want to create a new route called `todo.create.ts`

```typescript
import type { Static } from "@sinclair/typebox"
import type { FastifyReply, FastifyRequest } from "fastify"
import { Type } from "@sinclair/typebox"
import type { PluginFastifyInstance } from "@raclettejs/types"

const ParamsSchema = Type.Object({
  _id: Type.String(),
})
type Params = Static<typeof ParamsSchema>

export default (fastify: PluginFastifyInstance) => {
  const handler = async (
    req: FastifyRequest<{
      Params: Params
    }>,
    reply: FastifyReply,
  ) => {
    try {
      // Add owner and lastEditor from the authenticated user
      const todoData = {
        ...req.body,
        owner: req.user._id,
        lastEditor: req.user._id,
      }
      
      const payload = await fastify.custom.todoService.createTodo(
        fastify,
        req.requestParams,
        todoData,
      )
      
      return reply.status(201).send(payload)
    } catch (err: any) {
      fastify.log.error(err.message)
      return reply.internalServerError(err.message)
    }
  }

  return {
    handler,
    onRequest: [fastify.authenticate],
    config: {
      type: dataCreate,
      broadcastChannels: ["todoCreated", "dataCreated"],
    },
    schema: {
      summary: "Example todo post Route",
      description: "Example todo create Route",
      tags: ["myApp/todo"],
      body: todoCreateSchema,
    },
  }
}

```

## Creating data in our widget

Now we can query our endpoint with the frontendApi fron our component

```typescript
const { $data, [...] } = usePluginApi()
const {data, dataArr, response, query, execute, isLoading, error } = $data.todo.create({
  params: {},
  id: false,
  options: {
    immediate: false,
    cb: (result) => {},
    notify: true | false,
    responseType: "json",
    mode: "none" | "cors",
    useCache: true | false,
    useStore: true | false,
  },
  config: {}
})
```

- data - The resultobject
- dataArr - The resultArray
- response - The response from the server
- query - the query object (only in reading queries)
- execute - an awaitable funciton to trigger the action call. The response and result returned from this functions are not reactive! Use dataArr or data
- isLoading - a boolean indicator for the loading/fetch state
- error - contains the error object if errors are catched

::::

- id - if set this will be used instead of the query instance nanoId
- params - The object you want to send to the backend
- options
  - immediate - If true, the action will be executed right away, defaults to false
  - cb - A function which will get called after the action is resolved. Receives the result object
  - useStore - If false, will not write the data to the redux store. The data return will also not be available, use response instead. defaults to true
  - notify - if false, will not write into the notification que and snackbar, defaults to true
  - responseType - only used if you want to explicitly receive a http stream. Set to stream in that case, defaults to json
  - mode - if responseType is stream, you can set mode "cors" here

::::

After defining our action and the corresponding outputs we can now trigger the action when needed.

```typescript
const createData = async (newItem) => {
  // log the action outputs before and after to see what happens!
  console.log(data, query, execute, isLoading, error)
  const { result, response } = await execute(newItem)
  // log the action outputs before and after to see what happens!
  console.log(result, response)
  console.log(data, query, execute, isLoading, error)
}
```
