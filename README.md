<div align=center>
  <h1>Github Star Email</h1>
  <p>
    <a href="https://github.com/BlackHole1/github-star-email/blob/main/LICENSE" target="_blank"><img src="https://img.shields.io/github/license/BlackHole1/github-star-email" alt"license" /></a>
  </p>
  <p><a href="https://hub.oomol.com/package/github-star-email?open=true" target="_blank"><img src="https://static.oomol.com/assets/button.svg" alt="Open in OOMOL Studio" /></a></p>
</div>

Get the email addresses of all users who starred the specified repository.

![](./static/example.png)

## Params Details

* `owner` - GitHub username
* `repo` - Project Name
* `githubToken` - Github Token
  1. Open https://github.com/settings/tokens/new
  2. Select `read:user` in `user`
* `saveAs` - Save location, file suffix is ndjson.
* `continue` - When set to `true`, it supports task recovery, allowing continuation from where it left off even after an interruption. The default value is `true`.
