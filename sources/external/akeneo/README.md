# Akeneo Sources

Akeneo/PIM is the product governance and enrichment source. MVP service tests still use `mock-pim`, while Akeneo CE is introduced as optional local infrastructure under ignored `.local/akeneo/pim/`.

- https://www.akeneo.com/akeneo-pim-community-edition/
- https://github.com/akeneo/pim-community-dev
- https://github.com/akeneo/pim-community-standard
- https://docs.akeneo.com/latest/index.html
- https://www.akeneo.com/shopify/
- https://api.akeneo.com/events-documentation/subscription.html
- https://api.akeneo.com/events-reference/events-reference-serenity/products.html
- https://api.akeneo.com/event-platform/overview.html
- https://api.akeneo.com/event-platform/compatibility.html

Policy:

- Official Akeneo docs and repositories are source authority for installation and API behavior.
- Official Akeneo Events API and Event Platform docs are source authority for event payload and subscription behavior. Local CE bridge behavior is a project adapter, not a claim about hosted Event Platform support.
- Local docs describe this lab's boundary interpretation and setup wrapper.
- Do not commit generated Akeneo application files.
