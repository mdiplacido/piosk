# Todo list

- for package prod builds I see this in the console when the dev tool is loaded:
    - Uncaught Error: React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://fb.me/react-perf-use-the-production-build

- move dev only packages to the devDependencies section of package.json

- for save settings feature:
    - try implementing the spinner button debounce using hooks
    - experiment with how the redux-observable effects can get access to things like config... we can use dependencies, redux itself, another way?
    - hookup the add capture card button
    - show message when no capture cards configured.