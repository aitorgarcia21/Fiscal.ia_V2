"""update rendez_vous_professionnels

Revision ID: update_rendez_vous_professionnels
Revises: 
Create Date: 2024-06-18 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'update_rendez_vous_professionnels'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Supprimer la table si elle existe
    op.drop_table('rendez_vous_professionnels')
    
    # Recréer la table avec la nouvelle structure
    op.create_table('rendez_vous_professionnels',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('id_professionnel', sa.String(length=36), nullable=False),
        sa.Column('date_rdv', sa.DateTime(), nullable=False),
        sa.Column('duree', sa.Integer(), nullable=False),
        sa.Column('type_rdv', sa.String(), nullable=False),
        sa.Column('statut', sa.String(), nullable=False, server_default='en_attente'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rendez_vous_professionnels_id'), 'rendez_vous_professionnels', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_rendez_vous_professionnels_id'), table_name='rendez_vous_professionnels')
    op.drop_table('rendez_vous_professionnels') 