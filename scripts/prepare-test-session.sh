#!/usr/bin/env bash
# Mint a single-use auth-bypass token for one Revyl device session.
#
# Contract: every KEY=VALUE line on stdout becomes a launch variable for the
# one session being started. Anything else printed here is ignored.
set -euo pipefail

echo "Preparing a Nof1 test session..."

# The app compares the deep-link token against REVYL_AUTH_BYPASS_TOKEN from its
# launch environment, so any unguessable value proves the round trip. Mint once
# per session boot only — `revyl dev auth refresh` must reuse this value, not
# remint, or the app rejects the deep link.
token="revyl-$(od -An -tx1 -N16 /dev/urandom | tr -d ' \n')"

echo "REVYL_AUTH_BYPASS_ENABLED=true"
echo "REVYL_AUTH_BYPASS_TOKEN=${token}"
