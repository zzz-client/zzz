# Collaboration

Zzz was built with collaboration in mind.

## Local - Git

Storing requests in flat text files inside a Git repo is the simplest way to track requests for collaboration. More than that, you can utilize [Git sub-modules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to create a centralized repo that can be used to track all of the Scopes that a user has access to.  The outer repository will function as a workspace that can keep track of things like contexts. Not only requests but contexts, auths, and even cookies can tracked (or gitignored) for collaborative use.

It's important to note that you can work inside of a submodule like commit and push just like you would in a normal repository, so it's not as though you keep a separate directory for each repository of requests. You can just edit them in place and commit them to the submodule.

## Intranet - HTTP Server + Web Interface (or Desktop App)

Limitless Zzz web interface / HTTP API combos can be run on an intranet with whatever central storage mechanism is desired, be it flat text, relational DB, non-relationable DB, or blood sacrifice.

The desktop app can (should be able to eventually) connect to any HTTP Server so users can access the same HTTP Server by either the browser or the desktop Tauri app.

## Internet - HTTP Server + Web Interface (or Desktop App)

> NOTE: This is not presently supported and is not planned for the 1.0 milestone.

Zzz As A Service (ZaaS, if you will....pronounced "Zazz" of course). Able to be self-hosted but also available at zzz.dev or whatever TLD I can grab.

This would need some form of authentication and authorization, and would likely be a paid service. Though of course there would have to be some form of a free tier for open source projects, probably
