//#region src/host/index.ts
/**
* Host entry for dsh-cool-theme.
* No host routes needed — theme is purely client-side (localStorage + overrideTokens).
* Keep a minimal apply so the cordis patch has a mount point.
*/
const name = "dsh-cool-theme";
const inject = [];
function apply(_ctx) {}
//#endregion
export { apply, inject, name };
