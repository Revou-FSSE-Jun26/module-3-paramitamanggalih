"""add role to users

Revision ID: 1cdd4502dff8
Revises: 000000000001
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa


revision = "1cdd4502dff8"
down_revision = "000000000001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.String(length=50),
            nullable=False,
            server_default="customer",
        ),
    )

    op.alter_column(
        "users",
        "role",
        server_default=None,
    )


def downgrade():
    op.drop_column("users", "role")