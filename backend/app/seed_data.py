"""Static seed data. Not app config (see config.py) - these are fixed rows
inserted by migrations, kept here (rather than inline in the migration file)
so they're readable/reusable outside of alembic/versions/.
"""

from typing import NamedTuple


class DefaultCategory(NamedTuple):
    id: str
    name: str


# IDs are fixed (not generated at insert time) so seeding is deterministic
# across environments and re-running a migration downgrade/upgrade doesn't
# produce different rows. Do not change existing ids/names here without a
# follow-up migration - these are already-inserted primary keys in any
# database that has run 4e60c3ba57c7.
DEFAULT_EXPENSE_CATEGORIES: list[DefaultCategory] = [
    DefaultCategory("01671b60-584a-4e7d-9f1d-71b3484f87c0", "Food & Dining"),
    DefaultCategory("9de171de-f71f-4447-88b3-0243f3ba0544", "Transportation"),
    DefaultCategory("ee6ee0d8-9e84-4540-8988-81b648d7bb5a", "Housing"),
    DefaultCategory("aea1da13-47ff-4989-8db2-4fbd760daa2f", "Utilities"),
    DefaultCategory("2e2e3698-4341-44cd-b94e-59e82e8e89bd", "Entertainment"),
    DefaultCategory("163faf0f-914c-4639-9da2-e721813d63f9", "Health & Fitness"),
    DefaultCategory("5ad24502-b54c-4886-ba88-39f248d9310c", "Shopping"),
    DefaultCategory("6e63b821-6c55-4476-aa48-b36ed87a968c", "Travel"),
    DefaultCategory("2b9f508b-8bb9-4324-aa01-668629a33e60", "Education"),
    DefaultCategory("309941b3-40c8-4a26-bc98-6591e42a5c6a", "Other"),
]
