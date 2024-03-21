const newVersion = Deno.args[0];
if (!newVersion) {
  console.error('No version provided');
  Deno.exit(1);
}
Deno.writeTextFileSync('deno.jsonc', Deno.readTextFileSync('deno.jsonc').replace(/"version": ".+"/, `"version": "${newVersion}"`))
Deno.writeTextFileSync('src/desktop/tauri.conf.json', Deno.readTextFileSync('src/desktop/tauri.conf.json').replace(/"version": ".+"/, `"version": "${newVersion}"`))
Deno.writeTextFileSync('src/desktop/Cargo.toml', Deno.readTextFileSync('src/desktop/Cargo.toml').replace(/version = ".+"/, `version = "${newVersion}"`))
Deno.writeTextFileSync('scripts/desktop.nsi', Deno.readTextFileSync('scripts/desktop.nsi').replace(/\!define VERSION ".+"/, `!define VERSION "${newVersion}"`))
Deno.writeTextFileSync('scripts/cli.PKGBUILD', Deno.readTextFileSync('scripts/desktop.nsi').replace(/^pkgver=.+$/, `pkgver=${newVersion}`))
