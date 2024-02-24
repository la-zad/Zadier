## Secrets

### Global Secrets

You'll need to create the following secrets for the repository:
| Secret | Description |
|:-----------------:|:------------------------------------:|
| `SSH_PRIVATE_KEY` | SSH private key to access the server |
| `REMOTE_HOST` | Remote host to deploy to |
| `REMOTE_USER` | Remote user to deploy as |
| `REMOTE_PORT` | Remote port to deploy to |

### Environment Secrets

You'll need to create two github environments:

-   `main` for the production environment (targets the `main` branch)
-   `develop` for the development environment (targets the `develop` branch)

You'll need to create the following secrets for each environment:
| Secret | Description |
|:-----------:|:-----------------------:|
| `TOKEN` | Discord bot's token |
| `SERVER_ID` | Discord server's ID |
| `CLIENT_ID` | Discord bot's client ID |
| `REPLICATE_TOKEN` | Replicate API token |

And update the Dockerfile `ARG` list.
