# Versions, tags and releases

The design system has its own version number, separate from the app. It lives in `design-system/package.json` and is printed at the top of `dist/css/tokens.css`.

## What counts as which bump (SemVer: MAJOR.MINOR.PATCH)

| Change | Bump | Example |
|---|---|---|
| A token is **renamed or removed**, or its meaning changes | **MAJOR** (2.0.0) | `color.text.secondary` becomes `color.text.muted` |
| A token is **added**, or a component token is introduced | **MINOR** (1.1.0) | new `color.feedback.success` |
| A value is tuned without changing meaning | **PATCH** (1.0.1) | accent blue from `#1E4BD2` to `#1D4ACB` |

A change that visibly alters the look of the app is at least MINOR, even if only a value changed. Say so in the changelog.

## How every version is tracked and saved

1. **Git history.** Every token change is a commit, so `git log design-system/tokens` shows who changed what and when, and `git diff` between two commits shows the exact values.
2. **CHANGELOG.md.** A short human-readable entry per version, newest first.
3. **Git tags.** Each release is a tag named `design-system-vX.Y.Z`. You can return to any version with `git checkout design-system-v1.0.0`.
4. **GitHub Releases.** Pushing a tag makes the "Design system release" workflow publish a GitHub Release with the changelog entry and a `design-system-dist.zip` of that version's CSS, TypeScript and JSON.

## Release steps

```bash
# 1. on a branch, after editing tokens
cd design-system
npm version minor --no-git-tag-version     # or patch / major: bumps package.json
#    write the new section at the top of CHANGELOG.md
npm run verify                              # rebuilds dist/ with the new version and checks contrast

# 2. commit tokens + dist + changelog together, open a pull request, merge it

# 3. after the merge, on main:
git tag design-system-v1.1.0
git push origin design-system-v1.1.0        # the release workflow does the rest
```

The tag must match the version in `package.json`; the workflow stops with a clear error if it does not.

## What GitHub checks on every pull request

The "Design system check" workflow fails the pull request if:

- `dist/` is out of date compared with the tokens (someone forgot `npm run build`);
- a colour pair the app uses became unreadable (`npm run check`);
- `tokens/` changed but `package.json` and `CHANGELOG.md` did not (no version bump).

## Rolling back

Revert the commit that changed the token, or check out an older tag. `dist/` is committed, so the app builds from whatever is in the repository without any extra step.
