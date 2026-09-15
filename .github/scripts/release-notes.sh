#!/usr/bin/env bash
#
# Generate categorized release notes from conventional commits.
#
# Usage: release-notes.sh <tag>
#
# Groups every non-merge commit since the previous `v*` tag by its
# conventional-commit type and prints Markdown sections followed by a
# "Full Changelog" compare link. Run from the repository root.

set -euo pipefail

TAG="${1:?usage: release-notes.sh <tag>}"

REPO="${GITHUB_REPOSITORY:-}"
if [ -z "$REPO" ]; then
  REPO="$(git config --get remote.origin.url \
    | sed -E 's#(git@|https://)github\.com[:/]##; s#\.git$##')"
fi

# Previous release tag, so notes only cover what changed since then.
PREV="$(git describe --tags --abbrev=0 --match 'v[0-9]*' HEAD 2>/dev/null || true)"
if [ -n "$PREV" ]; then
  RANGE="${PREV}..HEAD"
else
  RANGE="HEAD"
fi

# Commit subjects, without merges and without version-bump noise.
SUBJECTS="$(git log --reverse --no-merges --pretty=format:'%s' "$RANGE" 2>/dev/null \
  | grep -vE '^(chore|ci|build|style)(\([^)]*\))?!?: *(bump|release)' || true)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
for group in features fixes performance refactoring documentation tests chores other; do
  : > "$TMP/$group"
done

while IFS= read -r subject; do
  if [ -z "$subject" ]; then
    continue
  fi

  if printf '%s' "$subject" | grep -qE '^[a-z]+(\([^)]*\))?!?:'; then
    type="$(printf '%s' "$subject" | sed -E 's/^([a-z]+)(\([^)]*\))?!?:.*/\1/')"
    text="$(printf '%s' "$subject" | sed -E 's/^[a-z]+(\([^)]*\))?!?: *//')"
  else
    type='other'
    text="$subject"
  fi

  case "$type" in
    feat) group=features ;;
    fix) group=fixes ;;
    perf) group=performance ;;
    refactor) group=refactoring ;;
    docs) group=documentation ;;
    test) group=tests ;;
    ci | chore | build | style) group=chores ;;
    *) group=other ;;
  esac

  printf -- '- %s\n' "$text" >> "$TMP/$group"
done <<< "$SUBJECTS"

sections=''
append_section() {
  local group="$1" title="$2"
  if [ -s "$TMP/$group" ]; then
    if [ -n "$sections" ]; then
      sections="${sections}"$'\n'
    fi
    sections="${sections}### ${title}"$'\n\n'"$(cat "$TMP/$group")"
  fi
}

append_section features 'Features'
append_section fixes 'Bug Fixes'
append_section performance 'Performance'
append_section refactoring 'Refactoring'
append_section documentation 'Documentation'
append_section tests 'Tests'
append_section chores 'Chores'
append_section other 'Other Changes'

if [ -z "$sections" ]; then
  sections='No notable changes.'
fi

printf '%s\n' "$sections"

if [ -n "$PREV" ]; then
  printf '\n**Full Changelog**: https://github.com/%s/compare/%s...%s\n' \
    "$REPO" "$PREV" "$TAG"
fi
