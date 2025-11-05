# `.gitignore`

The `.gitignore` file defines which files Git should deliberately leave untracked.

[Check out the git documentation.](https://git-scm.com/docs/gitignore)

We suggest including at least the following entries in your `.gitignore` file:

::: code-group

``` sh [.gitignore]
# keep this files
!.gitkeep

# editor directories and files
/tags
.tern-port
vim-session
.DS_Store
.vscode

# just in case when moving arround keys
keys
/ssh
/.ssh
id_rsa
id_rsa.pub

# ignore env files
.env*

# ignore reference folder
**/*-ref

node_modules
**/node_modules
.raclette
```

:::
