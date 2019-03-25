# Todo list

- for package prod builds I see this in the console when the dev tool is loaded:
    - Uncaught Error: React is running in production mode, but dead code elimination has not been applied. Read how to correctly configure React for production: https://fb.me/react-perf-use-the-production-build

- move dev only packages to the devDependencies section of package.json

- for save settings feature:
    - try implementing the spinner button debounce using hooks
    - experiment with how the redux-observable effects can get access to things like config... we can use dependencies, redux itself, another way?
    - show message when no capture cards configured.
    - show spinner when creating or updating capture information
    - show inline error if the capture name is already taken
    - add edit capture config
    - implement rest of the processing logic which includes more silent notifications to the log page
    - allow vertical scroll
    - config saves should probably switch maps as last writer should win, no? yes?
    - make webSecurity configurable per capture config
    - add pagination to the log view
    - clean-up CaptureService, it is a mess
    - move away from using the config name to find the config, introduce a UUID config id that we can match on.  we can still log the name, but we should match on config id.