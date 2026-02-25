#!/bin/bash
# Usage: ./scripts/commit-as.sh <persona> <commit-message>
# Personas: alice, bob, carol, dave, maintainer
#
# Example: ./scripts/commit-as.sh alice "Add PinCard component"

set -e

PERSONA=$1
shift
MESSAGE="$*"

if [ -z "$PERSONA" ] || [ -z "$MESSAGE" ]; then
  echo "Usage: ./scripts/commit-as.sh <persona> <commit-message>"
  echo "Personas: alice, bob, carol, dave, maintainer"
  exit 1
fi

case $PERSONA in
  alice)
    NAME="Alice Chen"
    EMAIL="jtbourke+alicechen@gmail.com"
    ;;
  bob)
    NAME="Bob Martinez"
    EMAIL="jtbourke+bobmartinez@gmail.com"
    ;;
  carol)
    NAME="Carol Park"
    EMAIL="jtbourke+carolpark@gmail.com"
    ;;
  dave)
    NAME="Dave Wilson"
    EMAIL="jtbourke+davewilson@gmail.com"
    ;;
  maintainer)
    NAME="JT Bourke"
    EMAIL="jtbourke@gmail.com"
    ;;
  *)
    echo "Unknown persona: $PERSONA"
    echo "Available: alice, bob, carol, dave, maintainer"
    exit 1
    ;;
esac

GIT_AUTHOR_NAME="$NAME" \
GIT_AUTHOR_EMAIL="$EMAIL" \
GIT_COMMITTER_NAME="$NAME" \
GIT_COMMITTER_EMAIL="$EMAIL" \
git commit -m "$MESSAGE"

echo "Committed as $NAME <$EMAIL>"
