All commands must have a JSDoc comment above their object.
The comment must respect the following format:

```js
/**
 * @command     - The command name
 * @description - Quick description of the command
 * @permission  - The permission(s) required to use the command and/or roles required.
 *
 * --- if subcommand(s) ---
 *   @subcommand    - The subcommand name
 *   @description   - Quick description of the subcommand
 *   @permission    - Additional permission(s) required to use the subcommand and/or roles required.
 * -------- end if --------
 */
```
