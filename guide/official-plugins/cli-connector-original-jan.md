---
outline: deep
---

# Raclette Script Connector

The raclette script connector enables site administrators to quickly and securely connect existing unix command line tools
into a raclette GUI widget.

The primary problem with exposing command line tools in web pages is security. And those problems are 3 fold:

1. When command shells are used to start the processes, code injection can never be fully contained.  
   So we don't use command shells. We use argv based functions to start processes.
2. To a lesser degree this kind of code injection can also true for any command line tool.  
   There are a lot of very powerful command line tool that you never want to expose fully to the net, but still need to use for something.
   So we provide a simple and flexible template structure (YAML or JSON) to restrict command lines to safe, use case specific subsets.
3. IO sanitation can also become a problem, in the programs that do input and output.  
   For this we provide a simple hooks API when it is needed.

It cannot be stressed enough that it will always take an experienced unix administrator to expose a command line tool on the web.  
And it will also always have to be on a specific narrow use case basis.  
If you make the use case too broad, you can be certain to have introduced security holes.

All the Script Connector Plugin does is give you a defined simple API to do this.  
But every time you want to expose some function, you will have to know the program you are exposing, you will have to know the system,
you are exposing, and you will have to restrict your use case and with it the arguments, the input and the output, to not expose something
you don't want to.

There are 4 different user roles to consider in the Script Connector plugin.
They all can be the same person, but usually aren't and shouldn't be.

1. The user. He is the one who only uses the raclette GUI.  
   He he doesn't even need to be aware that he is starting a command line tool down the line.
2. The user admin. He also only uses the web interface, but with more privileges.  
   He should only need to take action if something went wrong and clean up zombie processes.
3. The server admin. He is the one who decides which command line tools will be used in which way.  
   He is the one who has to know the system on which the programs run, and the programs themselves, and it is his responsibility to
   make unsafe use impossible, or at least manageable.  
   Ideally he is also role four, the javascript programmer. If not, he has to be in close contact with him.
4. The javascript programmer. Adjusts the input forms and sanitizes the program IO if needed.  
   You don't necessarily need a javascript programmer. But if the default form generated from the script template needs to be improved,
   or the command line tool has input or output that needs to be processed for security or usability reasons, then you need one.

## The POST `/script/:cmd` Endpoint - `{ args?: string[], input?: string } => { stdout: string, stderr: string, status: number|string }`

This is the raclette script connector endpoint that allows you to execute command line programs with an HTTP request.
This endpoint is geared towards single executions of short running programs, i.e. the whole program should be able to execute in a time frame
shorter than your browser request timeout. The default is 2 seconds, after which the process will be killed.

The `/script/:cmd` endpoint uses the `child_process.spawnSync` node API function.
It exposes all input options of this function to the server admin, but usually you don't need to do anything with this.

The program gets executed, and the request **returns** the `stdout` and `stderr` produced and the exit code or kill signal that ended it.  
Possible status codes are 200, 404 and 500.

If the program expects input into stdin, this can be provided by **input**. This is the only time you can provide input with this endpoint.

More often you will want to pass command line arguments with **args**. Those work together with the configured script template.

### Writing Script Templates

To be able to execute a command line tool with a `/script/:cmd` HTTP request, you need 1-3 things. All of them are specified in a
`scripts/<:cmd>.yaml` or `scripts/<:cmd>.json` script template. `:cmd` is of course the command name you want to give the script.  
Very often the command name is the same as the executable name provided in the template.

1. An executable program file (`exe`). Mandatory  
   It is the responsibility of the server admin to install the needed program on the server in a way it can be executed by the web server.  
   Both, just the executable name or a full path is possible to provide under the `exe` key.
   But of course if only the executable name is given, it is looked up with the `PATH` environment variable of your node server process.  
   As mentioned above, the script template name is often the same or similar to the executable name.  
   But especially when different endpoints with different `argv` parameters to the same executable are wanted or needed, the executable and
   command name are different.
2. Spawn options (`opts`).  
   Usually not needed. But taking advantage of the [`spawnSync`](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options) options, you can set the current working directory `cwd`, adjust environment variables or change process user identity.  
   This should not be needed often, except maybe the working directory. The default directory used is the `cwd` of the web server,
   usually `/app/` in the docker container.
3. Command line arguments (`args`).  
   Almost always needed. And a little bit more complicated, but not too much.
   We just specify the normal `argv` array of argument strings here. And often that's all this is: an array of strings.  
   But when there are parameters that need passing at runtime, every array position that needs to be filled in gets a
   placeholder object `{}`.  
   This means for every placeholder object in the args template, there must be an `args` argument passed from the `/script/:cmd` payload.

#### An Example

`chmod_recursive.yaml`

    exe: /bin/chmod
    args:
       - -R
       - {}
       - {}
    opts:
       cwd: /app/public

written by the server admin in `plugin/scriptConnector/server/scripts/`, together with a user sending:

    POST /plugin/pacifico/scriptConnector/script/chmod_recursive
    { "args": [ "a+r", "shared" ] }

will result in the execution of `/bin/chmod ` with the argv array `["-R", "a+r", "shared"]` in the directory `/app/public`.
Which of course will set the readable flags for users, groups and other for `/app/public/shared` and recursively all files in there.

Of course allowing the internet to set access flags freely is usually a bad idea, so restricting the input values is quite necessary.

There are two ways to do this, that usually work together:

The first way is to allow concatenating the arg strings themselves together. To do this you put an array in the argv position,
and in that array you have strings and placeholder objects. At run time the placeholder objects are filled with the respective `args`
position from the request, and then the whole array is joined.

    ...
    args:
       - -R
       - ["u+",{}]
       - {}

    ...

With an array like that, the mod argument can only start with `u+`, which means only user rights can be set.
The amount and order of the `args` in the request is still the same, because there is still the same amount and order of
placeholders in the template.

But it would also be nice to be able to restrict the strings that are filled into the placeholders.
And what better way to do this than regular expressions:

    ...
    args:
       - -R
       - ["u+",{allow: "^[rw]$"}]
       - {}

    ...

Now only `r` or `w` is allowed, no setting executable rights! If you use `deny` instead of allow you can exclude values.
If you use both `allow` and `deny`, first allow then deny is checked, i.e. deny always has the last word.

There is a third possible restriction parameter: `path`. This one is necessary to prevent using ".." to get out of the
current working directory. It is almost always a very bad idea to give access to the full file system over to a web interface.
Which means the paths that are allowed for a script parameter should be able to be limited to a sub tree.  
You can set this path as the string argument in a `path` placeholder.  
If you set the empty string, the configured `cwd` from opts is used.  
If no `cwd` is explicitly set, the current `process.cwd()` of the web server is used.

So finally we have:

    ...
    args:
       - -R
       - ["u+",{allow: "^[rw]$"}]
       - { path: "/app/public" }

    ...

Now the command can only set the user privileges to write or read to files under `/app/public`. It can't even remove them.

_It is often better to write multiple very restricted script templates, than one more powerful script template, because it is easier to reliably lock down vulnerabilities this way._

### Writing Script Hooks

It might still be necessary to process the input or the output before returning it. Maybe to do some custom filtering or reformatting or whatever. For this reason you can create a script hook file with up to three exported functions: `stdin`, `stdout`, `stderr`.  
All three functions take a string argument and produce a string argument.  
`stdin` is processed before it is passed to the program.
`stdout` and `stderr` are processed before they are written into the reply.

## The POST `/run/:cmd` Endpoint - `{ args?: string[] } => string`

For longer running processes, that potentially even require multiple instances of input or provide multiple instances of output, the `/run/:cmd/` endpoint exists. It utilizes the `child_process.spawn` node API function.
This endpoint doesn't immediately **return** the results, it just starts the process and gives you a `jobID` string. You can use this `jobID` to poll and manipulate the process state with the `/job/:id` endpoint.  
Possible status codes are 201, 404, 409 and 500.

Other than that it works mostly the same as the `/script/:cmd` endpoint:  
You have to define a script template, pretty much the same way.
Only difference is that the possible `opts` are the ones of the `spawn` function, not the `spawnSync` function.  
You also can define `IO` hooks. Those also have the same function signature, and can work the same way if the program is suited for it,
but there are additional features that will be explained later.

## The POST `/job/:id` Endpoint - `{ input?: string; signal?: string } => { done?: number|string; stdin: string[]; stdout: string[]; stderr: string[] }`

The `/job/:id` endpoint works with started processes.
You can pass **input** or named unix **signal**s (almost always `SIGTERM` or `SIGKILL`).
But more importantly you are able to follow program IO incrementally.  
Each request to a `jobID` **returns** the list of accumulated strings for `stdin`, `stdout` and `stderr`. And when the process ended, it also has the `done` field like above.  
As long as the process is still running, the HTTP status code is 202. If the process finished it is 200.  
And of course the error codes 400, 404 and 500 are still possible.
After a 200 or 500 status code, the process state is deleted, and the `jobID` cannot be used anymore.

### Writing Script Hooks for Jobs

Since IO is often delivered in many chunks at separate times here, the IO hooks can become more complicated.  
The function prototypes are still the same, but the `this` reference in the hook is set to the `IO` object, that has the complete string lists for all three io streams.

This allows the programmer to reformat and reparse all previous io. It even allows the hook to rewrite or delete `IO` history, to reduce network traffic, for example. Because by default, each call to `/job/:id` sends the whole `IO` history back every time.
But keep in mind that all changes you do to the history are permanent. Everything you delete is gone, everything you change is forever.
And what the hook returns gets appended to the respective `IO` history.

Another difference is, for jobs the input chunk parameter is a Buffer. And this buffer cannot necessarily always be directly converted into an utf-8 string, because the chunk can end mid multi-byte character or not be string data at all.
This fully depends on the program that is run.  
But usually it is enouhj to do `'' + s` or `s.toString('utf-8')` to get a string from the buffer.

## The GET `/jobs` Endpoint - `=> { id: string; cmd: string; argv: string[]; done?: number|string }`

This just gives you a list of all known processes. Not all of them still need to be running.  
Processes that ended, but haven't been cleaned up yet and haven't had the last bit of IO collected also are in the list.

This endpoint is restricted to admin users. Knowing `jobID`s that aren't your jobs is a security leak.
