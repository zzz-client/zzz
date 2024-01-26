# Collaboration


Zzz was built with collaboration in mind.

**Web**:As many Zzz web interface / REST API combos can be run on an intranet and connected to by users; when a submodule gets updated, the requests are updated for everyone. If I can ever get my shit together, maybe Zzz can be self hosted with auth.

**Git**: While it is extensively modular, a Git repo is the simplest way to track requests stored as YAML, JSON, or whatever text format. More than that, you can utilize Git subrepositories to create a centralized repo that can be used to track all of the Scopes that a user has access to.  The outer repository will function as a workspace that can keep track of things like contexts. It will end out looking something like In this way, not only requests, but contexts, auths, and even cookies can tracked in teh repo. Or simply forceignored.

## Database

One day I will write a SQLite Storage driver. Then I can port that to MariaDB or Postgres. who knows. but i do know that if Zzz is ever to be run at scale, it probably would not be okay with file storage or even SQLite.


